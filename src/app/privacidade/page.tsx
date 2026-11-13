import Link from "next/link";

/* eslint-disable react/no-unescaped-entities -- texto jurídico em português usa aspas retas */

export default function PoliticaPrivacidade() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-900 dark:text-zinc-100">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Última atualização: 08 de novembro de 2026.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Quem somos</h2>
        <p>
          Padoca Eterno ("nós", "nosso", "loja") opera este cardápio digital e
          painel de pedidos. Este site permite que você ("você", "cliente",
          "usuário") visualize produtos, faça pedidos e acompanhe o status de
          entrega.
        </p>
        <p>
          Este documento explica quais dados pessoais coletamos, por quê, como
          os usamos, por quanto tempo os guardamos e quais são seus direitos,
          conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Dados que coletamos</h2>
        <p>Coletamos apenas os dados necessários para atender seu pedido:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>Nome e telefone:</strong> para contato e confirmação do pedido.</li>
          <li><strong>Endereço de entrega:</strong> para entregar os produtos.</li>
          <li><strong>Detalhes do pedido:</strong> produtos, quantidade, preço, status e pagamento.</li>
          <li><strong>Método de pagamento:</strong> Pix, dinheiro ou cartão na entrega (não armazenamos dados de cartão).</li>
          <li><strong>Cookies e IP:</strong> para funcionamento do site e segurança (veja a seção de cookies).</li>
        </ul>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Não coletamos dados sensíveis (saúde, origem étnica, religião etc.) e
          não coletamos dados de crianças menores de 13 anos sem consentimento
          dos pais ou responsáveis.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Para que usamos seus dados</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Criar, processar e entregar seu pedido.</li>
          <li>Entrar em contato sobre o status da entrega.</li>
          <li>Emitir comprovante/fiscal quando aplicável.</li>
          <li>Cumprir obrigações legais (ex: notas fiscais, registros contábeis).</li>
          <li>Melhorar a segurança e prevenir fraudes.</li>
        </ul>
        <p>
          Não usamos seus dados para marketing direto a menos que você dê
          <strong>consentimento separado e explícito</strong> para isso.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de dados</h2>
        <p>
          Seus dados não são vendidos. Podemos compartilhar apenas com:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>Prestadores de serviço:</strong> hospedagem, envio de mensagens (ex: link do WhatsApp para confirmação de pedido) e pagamento, sempre sob contrato de proteção de dados.</li>
          <li><strong>Autoridades:</strong> quando exigido por lei ou ordem judicial.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Por quanto tempo guardamos seus dados</h2>
        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-semibold">Dado</th>
              <th className="pb-2 font-semibold">Retenção</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Cadastro e contato do cliente</td>
              <td className="py-2">5 anos após o último pedido (obrigação fiscal/civil).</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Pedidos e comprovantes</td>
              <td className="py-2">5 anos (obrigação fiscal).</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Mensagens de chat interno</td>
              <td className="py-2">90 dias após o encerramento do pedido.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Cookies não essenciais</td>
              <td className="py-2">Até você retirar o consentimento.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Logs de acesso/IP</td>
              <td className="py-2">6 meses (segurança).</td>
            </tr>
          </tbody>
        </table>
        <p>
          Após o prazo, os dados são excluídos ou anonimizados, salvo
          obrigação legal em contrário.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Seus direitos (LGPD)</h2>
        <p>Você pode solicitar, a qualquer momento:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Acesso aos seus dados pessoais.</li>
          <li>Correção de dados incompletos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Portabilidade dos dados a outro fornecedor.</li>
          <li>Revogação do consentimento.</li>
          <li>Informação sobre com quem seus dados foram compartilhados.</li>
        </ul>
        <p>
          Para exercer esses direitos, entre em contato pelo canal indicado na
          seção 9. Responderemos em até 15 dias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Segurança dos dados</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados
          contra acesso não autorizado, perda, alteração ou divulgação, de
          acordo com a natureza dos dados e os riscos envolvidos.
        </p>
        <p>
          <strong>Vazamento de dados:</strong> se houver incidente de segurança
          que possa gerar risco ou dano relevante a você, comunicaremos a
          Autoridade Nacional de Proteção de Dados (ANPD) e a você em até 3
          (três) dias úteis, conforme o art. 48 da LGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Crianças</h2>
        <p>
          Não coletamos dados de crianças menores de 13 anos sem o consentimento
          expresso dos pais ou responsáveis legais. Se identificarmos coleta
          indevida, excluiremos os dados imediatamente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Canal de contato / Encarregado de dados</h2>
        <p>
          Para dúvidas, solicitações de direitos ou relatos de incidente, entre
          em contato:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><strong>Encarregado de dados (DPO):</strong> responsável pela proteção de dados da loja.</li>
          <li><strong>E-mail:</strong> contato@padocaeterno.com.br</li>
          <li><strong>Telefone/WhatsApp:</strong> (11) 99999-9999</li>
          <li><strong>Solicitar acesso/exclusão de dados:</strong>{" "}
            <Link href="/privacidade/solicitar-dados">formulário do titular</Link>
          </li>
          <li><strong>Endereço:</strong> Av. Paulista, 1000 — Bela Vista, São Paulo/SP</li>
          <li><strong>CNPJ:</strong> 00.000.000/0001-00</li>
        </ul>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Substitua os valores acima pelos dados reais da sua loja antes de
          publicar.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Cookies e tecnologias semelhantes</h2>
        <p>
          Usamos cookies essenciais para o funcionamento do site (carrinho,
          sessão, preferências). Cookies não essenciais (analytics, marketing)
          só são usados após seu <strong>consentimento explícito</strong> por
          meio do banner de cookies. Você pode recusar a qualquer momento.
        </p>
        <p>
          Nenhum rastreador é ativado antes do seu consentimento.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta política. A data da última alteração fica no
          topo desta página. Recomendamos que você revise periodicamente.
        </p>
      </section>

      <nav className="mt-12 pt-6 border-t flex gap-4 text-sm">
        <Link href="/termos-de-uso" className="text-zinc-600 dark:text-zinc-400 hover:underline">
          Termos de Uso
        </Link>
        <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:underline">
          Voltar ao cardápio
        </Link>
      </nav>
    </main>
  );
}
