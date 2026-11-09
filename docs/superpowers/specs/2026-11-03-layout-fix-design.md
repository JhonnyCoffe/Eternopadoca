# Design: Corrigir layout quebrado

Problema: site sem layout, fotos grandes, texto sem formatação, botões ausentes.

Abordagem: Ajustar CSS principal (globals.css) e componentes principais para garantir:
- Container centralizado com max-width
- Imagens com aspect-ratio e tamanho máximo
- Botões visíveis com cores de contraste
- Espaçamento consistente

Componentes afetados: StoreFront, TrackingView, CartDrawer, Dashboard, e todos os componentes visuais.

Chamadas: Manter tema escuro existente, manter Tailwind, apenas corrigir layout.
