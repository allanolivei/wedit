. corrigir toolbar para aparecer e sumir na hora certa.
. deserializar editor no modo simples da revista.
. habilitar e desabilitar modo view (sem edicao)
. visualizar resultado da edicao.
. criar páginas.




. interfaces de janela receber eventos de resize e aplicar auto clamp para nao ficar fora da tela.
. redimensionar thumbnail do youtube quando imagem for carregada.
. criar sistema de pooling para reaproveitamento de templates criados fora da cena.
. reaproveitar codigo no redimensionamento de colunas no RowLayout
. resolver problema no IE quando comeca a carregar o widget de texto da janela de componentes






























https://img.youtube.com/vi/<insert-youtube-video-id-here>/0.jpg
https://img.youtube.com/vi/<insert-youtube-video-id-here>/1.jpg
https://img.youtube.com/vi/<insert-youtube-video-id-here>/2.jpg
https://img.youtube.com/vi/<insert-youtube-video-id-here>/3.jpg
The first one in the list is a full size image and others are thumbnail images. The default thumbnail image (ie. one of 1.jpg, 2.jpg, 3.jpg) is:

https://img.youtube.com/vi/<insert-youtube-video-id-here>/default.jpg
For the high quality version of the thumbnail use a url similar to this:

https://img.youtube.com/vi/<insert-youtube-video-id-here>/hqdefault.jpg
There is also a medium quality version of the thumbnail, using a url similar to the HQ:

https://img.youtube.com/vi/<insert-youtube-video-id-here>/mqdefault.jpg
For the standard definition version of the thumbnail, use a url similar to this:

https://img.youtube.com/vi/<insert-youtube-video-id-here>/sddefault.jpg
For the maximum resolution version of the thumbnail use a url similar to this:

https://img.youtube.com/vi/<insert-youtube-video-id-here>/maxresdefault.jpg
All of the above urls are available over http too. Additionally, the slightly shorter hostname i3.ytimg.com works in place of img.youtube.com in the example urls above.

Alternatively, you can use the YouTube Data API (v3) to get thumbnail images.