import Link from "next/link";

export default function TermosDeUso() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-900 dark:text-zinc-100">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Última atualização: 08 de novembro de 2026.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Aceite dos termos</h2>
        <p>
          Ao usar este cardápio digital e fazer pedidos pela Padoca Eterno,
          você concorda com estes Termos de Uso e com nossa
          <Link href="/privacidade">Política de Privacidade</Link>. Se não
          concordar, não use o site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Quem pode usar</h2>
        <p>
          O serviço é destinado a pessoas com 13 anos ou mais. Menores de 13
          anos só podem usar com consentimento dos pais ou responsáveis. Ao
          usar o site, você declara que tem capacidade legal para contratar.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Pedidos e pagamento</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>
            <strong>Preços:</strong> todos os preços exibidos incluem os
            impostos aplicáveis. A taxa de entrega e o pedido mínimo são
            mostrados antes de finalizar a compra. Não há taxas ocultas.
          </li>
          <li>
            <strong>Formas de pagamento:</strong> Pix, dinheiro ou cartão na
            entrega, conforme opções da loja.
          </li>
          <li>
            <strong>Confirmação:</strong> o pedido é confirmado quando a loja
            o aceita. Você recebe um código do pedido e pode acompanhar o
            status.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Entrega</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>A entrega é feita no endereço informado por você.</li>
          <li>O prazo estimado é exibido antes de finalizar o pedido.</li>
          <li>A loja se esforça para cumprir o prazo, mas não se responsabiliza por atrasos por fatores alheios à sua vontade (trânsito, clima, etc.).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Cancelamento e devolução</h2>
        <p>
          Você pode solicitar cancelamento enquanto o pedido ainda não estiver
          em preparação. Após a preparação ou saída para entrega, o
          cancelamento depende da loja. Produtos perecíveis não são
          elegíveis para devolução, exceto em caso de erro da loja ou produto
          avariado.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Responsabilidade do usuário</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Forneça dados verdadeiros e atualizados (nome, telefone, endereço).</li>
          <li>Não use o site para fins ilegais ou fraudulentos.</li>
          <li>Não tente interferir no funcionamento do site.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Propriedade intelectual</h2>
        <p>
          O conteúdo do site (textos, imagens, logotipos, layout) pertence à
          Padoca Eterno ou a seus respectivos titulares. Não use logotipos ou
          imagens de terceiros sem autorização.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Limitação de responsabilidade</h2>
        <p>
          A loja se esforça para manter o site funcionando, mas não garante que
          ele esteja sempre disponível ou isento de erros. Não nos
          responsabilizamos por danos indiretos decorrentes do uso ou
          impossibilidade de uso do site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Alterações dos termos</h2>
        <p>
          Podemos atualizar estes termos a qualquer momento. A versão vigente
          fica disponível nesta página com a data de atualização. O uso
          contínuo após as mudanças significa aceitação dos novos termos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Canal de contato</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>E-mail:</strong> contato@padocaeterno.com.br</li>
          <li><strong>Telefone/WhatsApp:</strong> (11) 99999-9999</li>
          <li><strong>Endereço:</strong> Av. Paulista, 1000 — Bela Vista, São Paulo/SP</li>
          <li><strong>CNPJ:</strong> 00.000.000/0001-00</li>
        </ul>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Substitua os valores acima pelos dados reais da sua loja antes de
          publicar.
        </p>
      </section>

      <nav className="mt-12 pt-6 border-t flex gap-4 text-sm">
        <Link href="/privacidade" className="text-zinc-600 dark:text-zinc-400 hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:underline">
          Voltar ao cardápio
        </Link>
      </nav>
    </main>
  );
}
