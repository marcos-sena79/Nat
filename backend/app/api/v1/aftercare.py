from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_active_user, get_current_admin_user
from ...models.aftercare import Aftercare, AftercareFollowUp
from ...models.ai_conversation import AIConversation, ConversationStatus
from ...models.ai_message import AIMessage, MessageAuthor, RiskLevel
from ...models.human_review import HumanReview, ReviewPriority, ReviewDecision
from ...models.triage_policy import TriagePolicy
from ...schemas.aftercare import (
    AftercareCreate, AftercareResponse,
    AftercareFollowUpCreate, AftercareFollowUpResponse,
    AIConversationCreate, AIConversationResponse,
    AIMessageCreate, AIMessageResponse,
    HumanReviewCreate, HumanReviewResponse
)

router = APIRouter()

@router.get("/appointments/{appointment_id}/aftercare", response_model=AftercareResponse)
def get_aftercare(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    aftercare = db.query(Aftercare).filter(
        Aftercare.appointment_id == appointment_id
    ).first()
    
    if not aftercare:
        raise HTTPException(status_code=404, detail="Aftercare not found")
    
    return aftercare

@router.post("/appointments/{appointment_id}/aftercare", response_model=AftercareResponse)
def create_aftercare(
    appointment_id: int,
    aftercare: AftercareCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Check if aftercare already exists
    existing = db.query(Aftercare).filter(
        Aftercare.appointment_id == appointment_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aftercare already exists for this appointment"
        )
    
    db_aftercare = Aftercare(
        appointment_id=appointment_id,
        instructions=aftercare.instructions,
        piercing_type=aftercare.piercing_type,
        piercing_location=aftercare.piercing_location,
        care_frequency=aftercare.care_frequency,
        healing_time_weeks=aftercare.healing_time_weeks,
        warning_signs=aftercare.warning_signs
    )
    db.add(db_aftercare)
    db.commit()
    db.refresh(db_aftercare)
    return db_aftercare

@router.post("/aftercare/{aftercare_id}/follow-up", response_model=AftercareFollowUpResponse)
def create_follow_up(
    aftercare_id: int,
    follow_up: AftercareFollowUpCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    aftercare = db.query(Aftercare).filter(Aftercare.id == aftercare_id).first()
    if not aftercare:
        raise HTTPException(status_code=404, detail="Aftercare not found")
    
    db_follow_up = AftercareFollowUp(
        aftercare_id=aftercare_id,
        message=follow_up.message,
        media_url=follow_up.media_url,
        sent_by_client=datetime.utcnow()
    )
    db.add(db_follow_up)
    db.commit()
    db.refresh(db_follow_up)
    return db_follow_up

@router.get("/aftercare/{aftercare_id}/follow-ups", response_model=List[AftercareFollowUpResponse])
def list_follow_ups(
    aftercare_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    follow_ups = db.query(AftercareFollowUp).filter(
        AftercareFollowUp.aftercare_id == aftercare_id
    ).order_by(AftercareFollowUp.created_at.asc()).all()
    return follow_ups

# AI Chat endpoints
@router.post("/conversations", response_model=AIConversationResponse)
def create_conversation(
    conversation: AIConversationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Check if conversation already exists for this appointment
    existing = db.query(AIConversation).filter(
        AIConversation.appointment_id == conversation.appointment_id,
        AIConversation.client_id == current_user.client_profile.id
    ).first()
    
    if existing:
        return existing
    
    db_conversation = AIConversation(
        appointment_id=conversation.appointment_id,
        client_id=current_user.client_profile.id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@router.post("/conversations/{conversation_id}/consent")
def give_consent(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conversation.consent_given = datetime.utcnow()
    db.commit()
    return {"message": "Consent recorded"}

@router.post("/conversations/{conversation_id}/messages", response_model=AIMessageResponse)
def send_message(
    conversation_id: int,
    message: AIMessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.client_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not conversation.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent required before using AI chat"
        )
    
    # Create client message
    db_message = AIMessage(
        conversation_id=conversation_id,
        author=MessageAuthor.CLIENT,
        content=message.content
    )
    db.add(db_message)
    
    # Generate AI response (simplified - in reality would call AI service)
    ai_response = generate_ai_response(message.content, conversation_id)
    
    db_ai_message = AIMessage(
        conversation_id=conversation_id,
        author=MessageAuthor.AI,
        content=ai_response["content"],
        risk_level=ai_response["risk_level"],
        guidelines_version=ai_response.get("guidelines_version"),
        model_version=ai_response.get("model_version")
    )
    db.add(db_ai_message)
    
    # Update conversation status based on risk level
    if ai_response["risk_level"] in [RiskLevel.HIGH, RiskLevel.URGENT]:
        conversation.status = ConversationStatus.PENDING_REVIEW
        
        # Create human review request
        review = HumanReview(
            conversation_id=conversation_id,
            priority=ReviewPriority.HIGH if ai_response["risk_level"] == RiskLevel.HIGH else ReviewPriority.URGENT,
            reason=ai_response.get("review_reason", "AI flagged for human review")
        )
        db.add(review)
    
    conversation.last_interaction = datetime.utcnow()
    db.commit()
    db.refresh(db_ai_message)
    return db_ai_message

def generate_ai_response(content: str, conversation_id: int):
    # Simplified AI response generation
    # In reality, this would call an AI service with the studio's guidelines
    
    content_lower = content.lower()
    
    # Check for urgent keywords
    urgent_keywords = ["febre", "pus", "inchaço severo", "dor intensa", "alergia", "infecção"]
    if any(keyword in content_lower for keyword in urgent_keywords):
        return {
            "content": "Você está descrevendo sintomas que requerem atenção médica imediata. Por favor, procure um profissional de saúde o mais rápido possível. Não é seguro aguardar.",
            "risk_level": RiskLevel.URGENT,
            "review_reason": "Sintomas de urgência detectados"
        }
    
    # Check for warning signs
    warning_keywords = ["vermelhidão", "inchaço", "dor", "secreção"]
    if any(keyword in content_lower for keyword in warning_keywords):
        return {
            "content": "Entendo sua preocupação. Para melhor te ajudar, vou encaminhar seu caso para revisão da profissional. Enquanto isso, mantenha a área limpa e evite tocar na perfuração. Lembre-se: a IA é apoio informativo; não fornece diagnóstico. Em caso de piora ou preocupação, procure avaliação profissional.",
            "risk_level": RiskLevel.HIGH,
            "review_reason": "Sintomas que requerem avaliação profissional"
        }
    
    # Default response
    return {
        "content": "Obrigado por compartilhar. Baseado nas orientações do estúdio, recomendo:\n\n1. Mantenha a área limpa com solução salina\n2. Evite tocar com as mãos sujas\n3. Não remova a joia\n4. Se notar qualquer mudança, entre em contato\n\nLembre-se: a IA é apoio informativo; não fornece diagnóstico. Em caso de piora ou preocupação, procure avaliação profissional.",
        "risk_level": RiskLevel.LOW,
        "guidelines_version": "1.0",
        "model_version": "1.0"
    }

@router.get("/conversations/{conversation_id}/messages", response_model=List[AIMessageResponse])
def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conversation_id
    ).order_by(AIMessage.created_at.asc()).all()
    return messages

@router.get("/reviews", response_model=List[HumanReviewResponse])
def list_reviews(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    query = db.query(HumanReview)
    
    if status:
        query = query.filter(HumanReview.decision == status)
    
    reviews = query.order_by(HumanReview.created_at.desc()).all()
    return reviews

@router.put("/reviews/{review_id}")
def update_review(
    review_id: int,
    decision: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    review = db.query(HumanReview).filter(HumanReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.decision = decision
    review.notes = notes
    review.reviewed_by = current_user.id
    review.reviewed_at = datetime.utcnow()
    
    # Update conversation status
    if decision == ReviewDecision.APPROVED:
        conversation = db.query(AIConversation).filter(
            AIConversation.id == review.conversation_id
        ).first()
        if conversation:
            conversation.status = ConversationStatus.RESOLVED
    
    db.commit()
    return {"message": "Review updated successfully"}