# Avaliação do pedido — Design curto

## Intenção
Permitir que cliente avalie pedido concluído com 1 a 5 estrelas, mantendo nota disponível para operação futura.

## Escopo
- Alterar texto para `Código de entrega: 0000`.
- Adicionar `rating?: number` e `ratedAt?: string` ao pedido.
- Exibir avaliação somente quando status for `concluido`.
- Salvar nota no SQLite através de endpoint público vinculado ao código do pedido.
- Impedir nova avaliação após nota salva.
- Mostrar confirmação `Obrigado pela avaliação!` após envio.

## Fora de escopo
- Comentários textuais.
- Avaliação separada do entregador ou produtos.
- Alterações em status ou fluxo de entrega.
- Relatórios administrativos nesta etapa.

## Segurança e validação
- Aceitar somente inteiros de 1 a 5.
- Recusar pedido inexistente ou não concluído.
- Recusar segunda avaliação.
- Não expor dados pessoais além do pedido já acessível pelo código.

## Persistência
A nota fica no objeto `Order`, preservada pelo backend JSON e SQLite existentes. O endpoint usa `mutateDb`, mantendo lock e transação atuais.

## UX
A tela de acompanhamento mantém resumo do pedido e mostra card de avaliação após entrega. Cinco estrelas são botões acessíveis; estrela selecionada fica destacada. O botão de envio fica desabilitado até seleção.
