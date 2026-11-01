# Rastreamento de entrega em tempo real — Design

## Objetivo

Permitir que o cliente acompanhe no mapa a posição do entregador enquanto o pedido estiver em `saiu`, com atualização quase em tempo real e custo inicial baixo.

O entregador inicia o compartilhamento de localização no painel. O cliente visualiza posição, última atualização e estimativa aproximada. Ao marcar `chegou`, o rastreamento para.

## Usuários

- **Cliente:** acompanha o pedido sem instalar aplicativo.
- **Entregador:** inicia, mantém e encerra o compartilhamento pelo navegador do celular.
- **Loja:** continua usando o fluxo atual de pedidos, sem operação adicional obrigatória.

## Objetivos

- Mostrar mapa e marcador do entregador na página `/pedido/[code]`.
- Enviar localização somente durante `saiu`.
- Atualizar posição em poucos segundos quando houver conexão.
- Exibir estado compreensível quando GPS, permissão ou conexão falhar.
- Parar atualizações ao chegar, concluir ou cancelar pedido.
- Proteger localização para que apenas cliente do pedido e usuários autorizados acessem.
- Funcionar primeiro em navegador mobile, sem exigir app nativo.
- Manter fallback visual e funcional quando o mapa não carregar.

## Não objetivos

- Navegação curva a curva para o entregador.
- Rastreamento durante preparo, retirada ou pedidos concluídos.
- Cálculo exato de ETA com trânsito nesta primeira versão.
- Histórico permanente do trajeto.
- Compartilhamento da localização fora do pedido.
- Integração inicial com Google Maps Platform.

## Abordagens consideradas

### GPS próprio + Supabase Realtime + OpenStreetMap — escolhida

O navegador do entregador usa `navigator.geolocation.watchPosition`. O servidor valida o pedido e grava a posição atual em Supabase. O cliente assina mudanças do pedido e atualiza o marcador. Leaflet renderiza mapa com tiles OpenStreetMap.

**Vantagens:** baixo custo inicial, atualizações quase em tempo real, sem cobrança inicial de mapas, compatível com arquitetura web atual.

**Custos e limites:** Supabase e tiles públicos têm limites e regras de uso; será necessário monitorar volume. OpenStreetMap não deve receber tráfego excessivo sem avaliar um provedor de tiles dedicado.

### GPS próprio + polling + OpenStreetMap — fallback ou MVP técnico

O entregador envia posição para a API atual. O cliente consulta a cada 10–15 segundos.

**Vantagens:** menor dependência externa e implementação mais simples.

**Desvantagens:** não é tempo real, gera chamadas repetidas e aumenta atraso e consumo de bateria.

### Google Maps Platform — não escolhida agora

Oferece mapa, rotas, trânsito e geocodificação maduros.

**Desvantagens:** exige billing, chave protegida e custo variável. Pode ser adotada depois para ETA e rotas avançadas.

## Decisões técnicas

### Estado da localização

Adicionar localização atual ao pedido ou a uma entidade vinculada ao pedido:

```ts
{
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  updatedAt: string;
}
```

A posição atual é suficiente nesta fase. Não persistir histórico do trajeto.

### Fluxo do entregador

1. Entregador assume pedido.
2. Pedido permanece em `pronto` até retirada.
3. Entregador inicia deslocamento e muda pedido para `saiu`.
4. Painel solicita permissão de localização.
5. `watchPosition` envia posição em intervalo controlado, com filtro mínimo de deslocamento.
6. Painel mostra `GPS ativo`, última sincronização e erro acionável.
7. Entregador marca `chegou`; watcher é encerrado.
8. Ao concluir ou cancelar, qualquer publicação posterior é rejeitada.

O botão de início deve deixar claro que a localização será compartilhada apenas para este pedido e durante a entrega.

### Fluxo do cliente

1. Cliente abre página do pedido.
2. Se status for `saiu`, exibe bloco de rastreamento.
3. Cliente recebe posição inicial e assina atualizações.
4. Mapa centraliza na posição do entregador.
5. Exibe última atualização, precisão aproximada e estado da conexão.
6. Se não houver posição, mostra “Aguardando localização do entregador”.
7. Se localização estiver antiga, mostra “Última atualização há X min” e mantém último ponto.
8. Ao status `chegou`, remove rastreamento ativo e mantém confirmação de chegada.

### Atualização em tempo real

Usar Supabase Realtime para broadcast ou mudanças de linha, conforme a modelagem final. O cliente deve:

- validar código do pedido antes de assinar;
- cancelar assinatura ao desmontar componente;
- tratar reconexão;
- manter último estado local durante falha breve;
- fazer fallback para polling quando Realtime falhar.

### Segurança

- Nunca aceitar `orderId` arbitrário sem validar usuário, código ou token público do pedido.
- Aceitar atualização de localização somente do entregador atribuído ao pedido.
- Aceitar publicação somente enquanto status for `saiu`.
- Limitar frequência e tamanho do payload.
- Não expor nome completo, telefone ou outros pedidos no canal Realtime.
- Não registrar coordenadas em logs.
- Definir retenção curta para posição atual e limpar localização após conclusão ou cancelamento.
- Exigir HTTPS em produção, pois geolocalização do navegador depende de contexto seguro.

## Design visual com Impeccable

### Página do cliente — modo Operate

Preservar identidade escura e vermelha existente, mas dar prioridade ao mapa e à leitura rápida:

- Mapa como primeiro bloco visual quando status for `saiu`.
- Cartão sobreposto ou abaixo do mapa com “Entregador a caminho”.
- Marcador de bicicleta com halo de atualização.
- Chip de conexão: `Ao vivo`, `Reconectando` ou `Última atualização`.
- ETA apresentado como faixa aproximada, sem prometer precisão.
- Endereço do cliente em bloco secundário.
- Ações de chat e WhatsApp continuam disponíveis.
- Estado sem localização deve parecer esperado, não erro fatal.
- Respeitar `prefers-reduced-motion`; não animar mapa continuamente.

### Painel do entregador — modo Operate

- Card da entrega mostra estado GPS junto ao status do pedido.
- Botão primário “Iniciar rota e compartilhar localização”.
- Após autorização: “GPS ativo” com horário da última sincronização.
- Erros de permissão oferecem instrução clara para habilitar localização.
- Botão de parar rastreamento não encerra entrega sem confirmação.
- Ações de chegada e conclusão permanecem separadas.
- Layout prioriza uso com uma mão e botões grandes.

### Estados obrigatórios

- Pedido ainda não saiu: nenhum mapa ativo.
- Aguardando início do GPS.
- Permissão negada.
- GPS ativo e sincronizando.
- Sem conexão.
- Última posição antiga.
- Entregador chegou.
- Pedido concluído ou cancelado.
- Mapa indisponível, com link para endereço no mapa externo.

## Custos

A primeira versão pode operar sem cobrança de mapas usando OpenStreetMap e dentro do plano gratuito do Supabase, desde que respeite limites de uso. Isso não significa custo zero garantido.

Possíveis custos futuros:

- Supabase acima dos limites do plano gratuito.
- Provedor de tiles dedicado em volume maior.
- Serviço de rotas, geocodificação ou ETA.
- Infraestrutura própria e armazenamento adicional.

Configurar variáveis de ambiente e documentação de limites antes de produção. Não incluir chaves no repositório.

## Restrições e riscos

- Navegadores suspendem localização em segundo plano, especialmente no mobile.
- Permissão negada impede rastreamento, mas não deve impedir entrega.
- GPS consome bateria e dados; limitar frequência e precisão conforme necessidade.
- Tiles públicos não são garantia de escala.
- Precisão varia em ambientes internos e áreas urbanas densas.
- A posição compartilhada é dado sensível; informar o cliente e o entregador.

## Critérios de aceitação

- Entregador consegue iniciar rastreamento em pedido atribuído.
- Cliente vê mapa somente em pedido `saiu`.
- Nova posição aparece no cliente sem recarregar a página quando Realtime funciona.
- Fallback de polling mantém acompanhamento quando Realtime falha.
- Permissão negada mostra instrução sem quebrar painel.
- Posição não pode ser enviada por outro entregador.
- Posição não aparece depois de `chegou`, `concluido` ou `cancelado`.
- Cliente vê horário da última atualização.
- Interface funciona em viewport mobile e desktop.
- Testes cobrem autorização, status, frequência, reconexão e limpeza.
- Detector visual do Impeccable não aponta problemas críticos nos alvos alterados.

## Decisão de hospedagem

A hospedagem ainda não foi definida. A primeira implementação deve manter portabilidade:

- SQLite atual continua como fonte única de verdade.
- SSE atende servidor único ou VPS.
- Polling continua como fallback para ambientes serverless ou conexões SSE interrompidas.
- O código não deve depender de conexão persistente para manter estado correto.
- Antes de produção, validar compatibilidade com o provedor escolhido e definir migração para banco gerenciado se necessário.

## O que permanece para o plano de implementação

- Definir autenticação do canal público de acompanhamento.
- Escolher biblioteca Leaflet e estratégia de tiles.
- Criar tabela ou estrutura `order_locations` sem reescrever pedidos inteiros a cada ping.
- Criar endpoints ou ações para publicar localização e stream SSE.
- Integrar componente de mapa cliente.
- Integrar watcher no painel do entregador.
- Atualizar tipos e testes.
- Documentar configuração local e produção.
- Validar visualmente nos tamanhos mobile e desktop.
