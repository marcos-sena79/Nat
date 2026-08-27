# Body Piercing & Pinturas em Tecido - Plataforma Completa

Plataforma responsiva para centralizar venda de produtos, agendamento de serviços e gestão completa do negócio.

## 🚀 Funcionalidades

### Loja Pública
- Catálogo de produtos (pinturas, joias, cuidados)
- Carrinho e checkout
- Cupons de desconto
- Pagamento via Pix e cartão (InfinitePay)

### Agendamento
- Serviços: perfurações, troca de joia, avaliações
- Calendário com horários disponíveis
- Pagamento de sinal opcional
- Visitas domiciliares com cálculo automático

### Assistente de IA
- Chat multimodal para acompanhamento
- Orientações baseadas em evidências
- Fila de revisão humana
- Limites de segurança claros

### Painel Administrativo
- Gestão de produtos e estoque
- Agenda e serviços
- Clientes e atendimentos
- Financeiro e relatórios
- Fichas de custo e precificação

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.12+** com **FastAPI**
- **PostgreSQL** com **SQLAlchemy 2.x**
- **Alembic** para migrações
- **Pydantic 2** para validação
- **Celery** com **Redis** para processamento assíncrono
- **Docker** para containerização

### Frontend
- **Next.js 14** com **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** para estado global

### Integrações
- **InfinitePay** - Pagamentos
- **Google Maps** - Geocodificação
- **WhatsApp** - Notificações
- **OpenAI** - Assistente de IA

## 📦 Estrutura do Projeto

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Rotas da API
│   │   ├── core/            # Configurações e segurança
│   │   ├── models/          # Modelos de banco de dados
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── services/        # Lógica de negócio
│   │   └── utils/           # Utilitários
│   ├── tests/               # Testes
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Páginas Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Python 3.12+
- Node.js 18+

### Usando Docker (Recomendado)

```bash
# Clonar o repositório
git clone <repository-url>
cd body-piercing-platform

# Iniciar os serviços
docker-compose up -d

# Acessar
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs
```

### Desenvolvimento Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 🔧 Configuração

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp backend/.env.example backend/.env
```

Variáveis importantes:
- `DATABASE_URL` - Conexão com PostgreSQL
- `SECRET_KEY` - Chave secreta para JWT
- `INFINITEPAY_API_KEY` - Chave da InfinitePay
- `AI_API_KEY` - Chave da API de IA

## 📊 Modelos de Dados

O sistema possui as seguintes entidades principais:

- **Usuários** - Clientes e administradores
- **Produtos** - Pinturas, joias, cuidados
- **Serviços** - Perfurações, trocas, avaliações
- **Agendamentos** - Reservas de serviços
- **Pedidos** - Compras e checkout
- **Pagamentos** - Transações financeiras
- **Insumos** - Materiais e estoque
- **Fichas de Custo** - Precificação
- **Acompanhamento** - Pós-perfuração com IA

## 🔒 Segurança

- Autenticação JWT
- Login social (Google, Facebook)
- Criptografia de senhas
- Controle de acesso por perfil
- LGPD compliance
- Auditoria de ações

## 🧪 Testes

```bash
# Backend
cd backend
pytest

# Com cobertura
pytest --cov=app --cov-report=html
```

## 📝 Licença

Este é um projeto privado. Todos os direitos reservados.