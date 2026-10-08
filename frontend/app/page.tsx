import Link from 'next/link'
import Navbar from './components/Navbar'

const collections = [
  {
    eyebrow: 'Joias para perfuração',
    name: 'A beleza dos detalhes',
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85',
  },
  {
    eyebrow: 'Arte têxtil autoral',
    name: 'Peças feitas à mão',
    image:
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85',
  },
  {
    eyebrow: 'Cuidado com a pele',
    name: 'Um ritual gentil',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
  },
]

const promises = [
  {
    number: '01',
    title: 'Cuidado em cada etapa',
    description: 'Da escolha da joia ao acompanhamento atento da cicatrização.',
  },
  {
    number: '02',
    title: 'Segurança de verdade',
    description: 'Materiais rastreáveis, processo esterilizado e orientação clara.',
  },
  {
    number: '03',
    title: 'Feito para você',
    description: 'Atendimento tranquilo, com tempo para conversar e escolher.',
  },
  {
    number: '04',
    title: 'Arte que acompanha',
    description: 'Joalheria e pintura autoral reunidas em um só atelier.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8f3]">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.02fr_0.98fr] md:items-center md:px-8 md:pb-24 md:pt-16">
        <div className="max-w-xl">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a4b59]">
            Atelier Corpo &amp; Cor · São Paulo
          </p>
          <h1 className="max-w-lg text-4xl leading-[1.08] text-[#221b25] sm:text-5xl lg:text-[64px]">
            Onde a beleza encontra o cuidado.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-[#70666d] sm:text-base">
            Piercing consciente, joias em titânio e arte têxtil autoral.
            Um espaço acolhedor para escolher com calma e cuidar de cada detalhe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-[#8a4b59] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#6f3542]"
            >
              Conheça as joias <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/scheduling"
              className="rounded-full border border-[#221b25]/20 px-6 py-3 text-xs font-medium text-[#221b25] transition hover:bg-[#f6ece1]"
            >
              Agendar perfuração
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#70666d]">
            <span>✓ Titânio ASTM F-136</span>
            <span>✓ Biossegurança monitorada</span>
            <span>✓ Acompanhamento pós-atendimento</span>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-[#e8d8c8] sm:min-h-[470px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            aria-label="Detalhes artesanais em tons naturais no atelier"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(34,27,37,0.02) 35%, rgba(34,27,37,0.48) 100%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90')",
            }}
          />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Um atelier para sentir-se em casa</p>
              <p className="mt-2 font-serif text-2xl sm:text-3xl">Corpo, cor e cuidado.</p>
            </div>
            <span className="hidden rounded-full border border-white/50 px-4 py-2 text-[10px] sm:block">Pinheiros · São Paulo</span>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#fcf2e7]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-9 sm:grid-cols-2 md:grid-cols-4 md:px-8 md:py-12">
          {promises.map((promise) => (
            <article key={promise.number} className="border-l border-[#8a4b59]/30 pl-4">
              <p className="text-[10px] tracking-[0.14em] text-[#8a4b59]">{promise.number}</p>
              <h2 className="mt-2 text-lg text-[#221b25]">{promise.title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#70666d]">{promise.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a4b59]">Feito com intenção</p>
            <h2 className="mt-3 text-3xl text-[#221b25] sm:text-4xl">Peças para acompanhar você</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#70666d]">
              Joias escolhidas com critério, arte têxtil com personalidade e cuidados para o dia a dia.
            </p>
          </div>
          <Link href="/catalog" className="hidden shrink-0 text-xs font-medium text-[#8a4b59] hover:text-[#6f3542] sm:block">
            Ver toda a coleção <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => (
            <Link
              href="/catalog"
              key={item.name}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                role="img"
                aria-label={item.name}
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              <div className="flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a4b59]">{item.eyebrow}</p>
                  <h3 className="mt-2 text-xl text-[#221b25]">{item.name}</h3>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6ece1] text-sm text-[#6f3542] transition group-hover:bg-[#8a4b59] group-hover:text-white" aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/catalog" className="mt-6 inline-flex text-xs font-medium text-[#8a4b59] sm:hidden">
          Ver toda a coleção <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="bg-[#221b25] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center md:px-8 md:py-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6b4b6]">Piercing com presença</p>
            <h2 className="mt-4 max-w-lg text-3xl leading-tight sm:text-4xl">
              Um momento seu, com tempo, escuta e segurança.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
              A gente conversa sobre a perfuração, explica os materiais e prepara tudo com cuidado.
              Você escolhe no seu ritmo — sem pressa e sem surpresas.
            </p>
            <Link
              href="/scheduling"
              className="mt-7 inline-flex rounded-full bg-[#8a4b59] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#a66370]"
            >
              Encontrar um horário <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-xl text-[#e6b4b6]">✳</span>
              <h3 className="mt-4 text-xl">No atelier</h3>
              <p className="mt-2 text-xs leading-5 text-white/60">Um ambiente pensado para receber você com calma e acolhimento.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:mt-8">
              <span className="text-xl text-[#e6b4b6]">⌂</span>
              <h3 className="mt-4 text-xl">Na sua casa</h3>
              <p className="mt-2 text-xs leading-5 text-white/60">Consulte disponibilidade para atendimento domiciliar em São Paulo.</p>
            </div>
            <Link href="/aftercare" className="rounded-2xl bg-[#f6ece1] p-5 text-[#221b25] sm:col-span-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a4b59]">Cuidado que continua</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="text-xl">Orientação pós-perfuração com acompanhamento humano</h3>
                <span className="text-lg text-[#8a4b59]" aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center md:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a4b59]">Seu próximo capítulo começa aqui</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-tight text-[#221b25] sm:text-4xl">
          Pronta para transformar seu corpo com cuidado e arte?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#70666d]">
          Descubra nossas joias, escolha uma peça autoral ou converse com a gente sobre sua próxima perfuração.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/scheduling" className="rounded-full bg-[#8a4b59] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#6f3542]">Agendar atendimento</Link>
          <Link href="/catalog" className="rounded-full border border-black/15 px-6 py-3 text-xs font-medium text-[#221b25] transition hover:bg-[#f6ece1]">Explorar a loja</Link>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-[#fcf2e7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          <div className="sm:col-span-2">
            <Link href="/" className="font-serif text-2xl text-[#221b25]">Atelier Corpo &amp; Cor</Link>
            <p className="mt-3 max-w-sm text-xs leading-5 text-[#70666d]">
              A harmonia entre biossegurança, joalheria e arte têxtil — com acolhimento e escuta sensível em São Paulo.
            </p>
            <p className="mt-4 text-[10px] text-[#70666d]">⌖ São Paulo · SP · Atendimento em atelier e home care</p>
          </div>
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em]">Navegação</h2>
            <div className="mt-3 grid gap-2 text-xs text-[#70666d]">
              <Link href="/catalog" className="hover:text-[#8a4b59]">Joias &amp; coleções</Link>
              <Link href="/scheduling" className="hover:text-[#8a4b59]">Agendamento</Link>
              <Link href="/aftercare" className="hover:text-[#8a4b59]">Pós-perfuração</Link>
            </div>
          </div>
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em]">Atendimento seguro</h2>
            <div className="mt-3 grid gap-2 text-xs text-[#70666d]">
              <span>Autoclave monitorada</span>
              <span>Titânio ASTM F-136</span>
              <Link href="/login" className="hover:text-[#8a4b59]">Área do cliente</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 border-t border-black/5 px-5 py-4 text-[10px] text-[#70666d] sm:flex-row md:px-8">
          <span>© 2025 Atelier Corpo &amp; Cor. Todos os direitos reservados.</span>
          <span>São Paulo · Brasil · Registro sanitário ativo</span>
        </div>
      </footer>
    </main>
  )
}
