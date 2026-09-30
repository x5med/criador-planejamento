# X5 Planejamento — design system no Figma

Atualização de design · 30/09/2026 · v0.7

[**Abrir visão geral**](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8/Sem-t%C3%ADtulo?node-id=6-1038)

## Entrega

O arquivo contém **15 pranchas editáveis**: fundações, componentes e estados, sete vistas desktop do fluxo, uma visão geral escura, três vistas mobile, uma biblioteca e um catálogo de cards chip. O design system atual combina as referências TaskLab e widgets chip enviadas pelo usuário com padrões de navegação e controles das [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials). É uma adaptação visual para o produto web X5, sem afirmar que os controles são nativos da Apple.

- **Hierarquia:** canvas cinza claro, cards brancos, preto para foco e verde-lima para ações e indicadores.
- **Materiais:** vidro e blur na sidebar, cabeçalhos e barra inferior mobile; conteúdo estratégico em superfícies estáveis.
- **Geometria:** cantos contínuos, painel de 48 px, cards de 24/32 px, controles em pílula.
- **Controles:** seletor de horizonte de 12, 24 ou 36 meses, com seis variantes para tema claro/escuro; instâncias na abertura desktop, abertura mobile e catálogo de estados.
- **Marca:** logo Grupo X5 mantida como PNG nos componentes de marca e nas telas.
- **Cards chip:** corpo preto com recorte vetorial no topo, faixa colorida encaixada e numerais em Sora SemiBold. Prioridades usam lima, objetivos usam menta, qualidade usa lima claro e lacunas usam coral suave, vinculados à paleta X5 existente. As oito variantes cobrem quatro métricas em Desktop e Mobile. Dez instâncias estão nas visões gerais clara, escura e mobile.
- **Tipografia:** Sora em todas as 15 pranchas, nos componentes e nos 51 estilos locais. Regular para leitura, SemiBold para controles e indicadores, Bold/ExtraBold para títulos. Valores dos cards em 46/56 px no desktop e 32/44 px no mobile.

A biblioteca possui 44 componentes, 185 instâncias no arquivo, 110 variáveis em três coleções, 51 estilos tipográficos e sete estilos de efeito. Os controles e cards são editáveis por variantes no Figma. A troca de variantes no editor não representa o comportamento funcional da aplicação.

## Pranchas

| Área | Link |
|---|---|
| Fundações | [00](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-328) |
| Componentes e estados | [01](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-482) |
| Novo planejamento desktop | [02](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-682) |
| Entrevista desktop | [03](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-799) |
| Visão geral desktop | [04](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-1038) |
| Diagnóstico | [05](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-1357) |
| Escolhas | [06](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-1627) |
| Execução | [07](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-1900) |
| Governança | [08](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-2216) |
| Visão geral escura | [09](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-2463) |
| Novo planejamento mobile | [10](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-2782) |
| Entrevista mobile | [11](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-2844) |
| Visão geral mobile | [12](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-2916) |
| Biblioteca nativa X5 | [13](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=10-2) |
| Cards chip | [14](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=60-650) |

## Tokens principais

| Papel | Valor |
|---|---|
| Destaque lima | `#D8F36A` |
| Tinta | `#111111` |
| Canvas claro | `#E7EBE4` |
| Card claro | `#FFFFFF` |
| Superfície escura | `#232620` |
| Navegação clara | Branco 76%, blur 24 px |
| Navegação escura | `#242820` 86%, blur 24 px |
| Foco | `#59710B` |
| Corpo do card chip | `#111111` |
| Chip de prioridades | `#D8F36A` |
| Chip de objetivos | `#A8E4DA` |
| Chip de qualidade | `#EDF8C0` |
| Chip de lacunas | `#F9DED8` |

As coleções **X5 · Primitives**, **X5 · Semantic** e **X5 · Geometry** permanecem ligadas aos componentes. Os efeitos de navegação possuem versões Light e Dark. O catálogo de valores está em [tokens.json](tokens.json).

## Critérios de uso

O material translúcido destaca navegação e controles; os cards de leitura preservam contraste e estabilidade visual. A implementação front end deve oferecer superfície sólida quando o usuário reduz transparência e desativar transições quando reduz movimento. Campos, ícones isolados e segmentos seguem alvo de toque de pelo menos 44 px. A interface precisa anunciar a opção selecionada no código e permitir seleção por teclado.

A referência Apple foi consultada em [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) e [Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls). O kit comunitário identificado pelo Figma não concedeu permissão de importação para este arquivo; o componente X5 foi construído localmente.

Os cards `X5/Card/Chip` usam variantes `Metric` e `Size`. Rótulo, valor, legenda e tag podem ser editados como texto na instância; `Meta` é propriedade compartilhada. Ao alterar os dados, atualizar também a contagem de pontos ou o preenchimento da barra. Os três pontos do recorte são decorativos. O tamanho de referência é 275 × 210 px no desktop e 169 × 178 px no mobile, com intervalo mobile de 10 px; em código, usar largura fluida e reorganizar a grade quando necessário.

## Verificação e continuidade

As 14 pranchas anteriores foram auditadas após a edição dos elementos Apple. A edição dos cards chip conferiu as oito variantes, as 18 instâncias da família e as três linhas de indicadores, sem ultrapassar a largura disponível. A revisão visual final do catálogo e da visão geral mobile confirmou legendas, recortes e espaçamento. A checagem visual não substitui os testes de acessibilidade e responsividade da implementação previstos no [PRD](../../docs/prd-frontend-design-system.md).

Os registros de edição estão em [reference-system-update.json](reference-system-update.json), [apple-elements-update.json](apple-elements-update.json), [chip-cards-update.json](chip-cards-update.json) e [chip-cards-fix.json](chip-cards-fix.json). A conferência atual está em [chip-final-audit.json](chip-final-audit.json). `native-export.json`, `business-contrast-audit.json` e capturas anteriores registram versões históricas; seus valores não representam a paleta atual. Os scripts `apply-*.js` e `fix-chip-content.js` são registros de execução sobre IDs específicos e não devem ser reexecutados sem revisão.

O ajuste de cores mais recente está em [chip-colors-update.json](chip-colors-update.json). Os oito componentes e suas 18 instâncias herdaram a paleta X5 por variáveis; o catálogo e o mobile passaram pela revisão visual após a alteração. Os textos principais sobre as faixas têm contraste de pelo menos 13,29:1; branco sobre o corpo preto tem 18,88:1.

A migração tipográfica está em [sora-type-update.json](sora-type-update.json): os 888 textos e os 51 estilos locais usam Sora. A auditoria não encontrou texto visível fora dos limites de um ancestral com corte ativo. Visão geral desktop, visão geral mobile, abertura mobile e catálogo de cards tiveram revisão visual; os rótulos da navegação mobile foram centralizados e dimensionados para a nova fonte. O script `apply-sora-type.js` registra a execução inicial e não deve ser reexecutado sem revisão dos ajustes posteriores.

Nesta etapa, as mudanças foram aplicadas no Figma e na documentação do design system. A aplicação Next.js ainda precisa receber a mesma direção visual em código.
