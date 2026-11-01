# Design: Cardápio real com extração de fotos

## Intento
Criar cardápio real a partir das 10 fotos de `C:\Users\Kawan\Desktop\FOTOSD`.

## Abordagem escolhida
Tela `/admin/fotos` para extração manual: cada foto pode gerar vários produtos.

## Partes
- Copiar fotos para `public/uploads/fotos/`.
- Nova página `/admin/fotos` listando fotos (thumbnail). Cada foto abre lista de produtos vinculados (nome, preço, estoque, categoria, imagem = foto original ou subimagem).
- `ProductsManager`: destacar estoque (`Estoque: X un`) sem precisar abrir edição.
- Fotos redimensionadas para 800×800 (já indicado no código, mantido).

## Não faz parte
- Não altera `StoreFront` (estoque só no dono).
- Não altera `OrdersBoard`, `KitchenDisplay`, etc.
- Não usa IA/extração automática.

## Próximo passo
Aprovação do design. Em seguida: `writing-plans` e implementação.
