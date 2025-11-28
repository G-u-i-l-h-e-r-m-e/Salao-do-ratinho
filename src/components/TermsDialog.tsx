import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
}

export function TermsDialog({ open, onAccept }: TermsDialogProps) {
  const [showFullTerms, setShowFullTerms] = useState(false);

  if (showFullTerms) {
    return (
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Termos e Condições de Uso do Site</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4">
                <p>
                  <strong>1.</strong> Este Termo se refere ao(à) Salão do Ratinho. Ao navegar neste site e usar os serviços que são fornecidos, você AFIRMA que LEU, COMPREENDEU e CONCORDA com nossos Termos e Condições. Estes Termos e Condições abrangem todos os aplicativos, serviços de Internet ou extensões dos sites relacionados. Caso você não concorde ou não tenha ficado claro algum ponto, sugere-se que você NÃO NAVEGUE MAIS NELE até que você tenha sanado todas as suas dúvidas. Você poderá ainda, a qualquer tempo, retornar ao site, clicar em termos de uso e reler quantas vezes desejar.
                </p>

                <p className="font-semibold">Termos e Condições</p>

                <p>
                  <strong>2.</strong> Os Termos e Condições de Salão do Ratinho regem o uso deste Site e todo o seu conteúdo ("Site"). Estes Termos descrevem as regras e regulamentos que orientam o uso de Salão do Ratinho. Todos os materiais/informações/documentos/serviços ou todas as outras entidades (coletivamente referidas como "conteúdo") que aparecem no site serão administrados de acordo com estes Termos e Condições.
                </p>

                <p className="text-destructive">
                  ATENÇÃO: Não continue a usar este site se você tiver qualquer objeção a qualquer uma das disposições dos Termos e Condições declarados nesta página.
                </p>

                <p>
                  <strong>3.</strong> O site é destinado a usuários com 18 (dezoito) anos de idade ou mais. Se você tem menos de 18 (dezoito) anos, não poderá usar ou registrar-se para usar este site ou seus serviços sem a permissão ou consentimento dos pais. Ao concordar com estes Termos e Condições, você tem a capacidade legal necessária para cumprir e ficar vinculado por estes Termos e Condições.
                </p>

                <p>
                  <strong>4.</strong> Salão do Ratinho faz uso de cookies. Ao acessar nosso site, você concorda em usar cookies nos termos da nossa Política de Cookies. Salienta-se que algum dos nossos parceiros de site podem usar cookies.
                </p>

                <p>
                  <strong>5.</strong> Salão do Ratinho detém os direitos de propriedade intelectual de todo o conteúdo. Todos os direitos de propriedade intelectual são reservados. Você pode acessar qualquer conteúdo do site para seu uso pessoal, sujeito às restrições definidas nestes termos e condições. Salão do Ratinho, por meio deste, determina que o usuário do site não cometa as seguintes ações:
                </p>

                <ul className="list-disc pl-6 space-y-1">
                  <li>Reproduzir, republicar, duplicar ou copiar qualquer conteúdo de Salão do Ratinho;</li>
                  <li>Vender, alugar, sublicenciar e/ou de outra forma comercializar qualquer conteúdo de Salão do Ratinho;</li>
                  <li>Executar e/ou exibir publicamente qualquer conteúdo de Salão do Ratinho;</li>
                  <li>Usar este site de forma que seja, ou talvez, danifique e/ou afete o acesso do usuário a este site;</li>
                  <li>Usar este site contrário às regras, leis e regulamentos relevantes do seu país de residência, ou de uma maneira que cause, ou possa causar, danos ao site ou a qualquer pessoa ou entidade comercial;</li>
                  <li>Realizar mineração de dados ou qualquer outra atividade semelhante relacionada a este site, ou durante o uso deste site;</li>
                  <li>Usando este site para se envolver em qualquer forma de publicidade ou marketing empresarial.</li>
                </ul>

                <p>
                  <strong>6.</strong> Áreas específicas deste site podem ser restritas ao acesso do usuário, e Salão do Ratinho pode estender ainda mais essa restrição a todo o site, a qualquer momento e a seu exclusivo critério. Qualquer identificação de usuário, chave de segurança ou senha que você possa ter neste site são confidenciais e você é responsável por manter a confidencialidade dessas informações.
                </p>

                <p className="font-semibold">Link e Hiperlink</p>

                <p>
                  <strong>7.</strong> Nós nos reservamos o direito de registrar solicitações para que você remova todos os links ou qualquer link específico criado por você que redirecione para o nosso site, e você aprova a remoção imediata desses links para o nosso site, mediante solicitação.
                </p>

                <p>
                  <strong>8.</strong> Podemos alterar os termos e condições desses direitos de vinculação a qualquer momento. Ao conectar-se continuamente ao nosso site, você concorda em se comprometer e seguir os termos desta política de links.
                </p>

                <p>
                  <strong>9.</strong> Por favor, entre em contato conosco se encontrar algum link em nosso site que seja ofensivo, e poderemos considerar e analisar solicitações de remoção de tais links.
                </p>

                <p className="font-semibold">Link para conteúdo de terceiros</p>

                <p>
                  <strong>10.</strong> Este site pode conter links para sites ou aplicativos operados por terceiros. Não controlamos nenhum desses sites ou aplicativos de terceiros ou o operador de terceiros. Este Site, objeto do presente Termos de Uso não é responsável e não endossa quaisquer sites ou aplicativos de terceiros ou sua disponibilidade ou conteúdo. Salão do Ratinho não se responsabiliza pelos anúncios contidos no site. Você concorda em fazê-lo por sua própria conta e risco ao adquirir quaisquer bens e/ou serviços de terceiros. O anunciante é quem permanece responsável por tais bens e/ou serviços, e se você tiver alguma dúvida ou reclamação sobre eles, você deve entrar em contato com o anunciante.
                </p>

                <p className="font-semibold">Conteúdo do usuário</p>

                <p>
                  <strong>11.</strong> Importante salientar que o termo usado "Conteúdo do Usuário" significa qualquer áudio, vídeo, texto, imagens ou outro material ou conteúdo que você decida exibir neste Site. Com relação ao conteúdo do usuário, ao exibi-lo, você concede para Salão do Ratinho uma licença não exclusiva, mundial, irrevogável, isenta de royalties e sublicenciável para usar, reproduzir, adaptar, publicar, traduzir e distribuir em qualquer mídia.
                </p>

                <p>
                  <strong>12.</strong> O Conteúdo do Usuário deve ser seu e não deve infringir os direitos de terceiros. Salão do Ratinho reserva-se o direito de remover qualquer parte do seu conteúdo deste site a qualquer momento, sem aviso prévio. Salão do Ratinho tem permissão para monitorar suas atividades no site e remover qualquer conteúdo do usuário considerado impróprio, ofensivo, contrário às leis e regulamentos aplicáveis, ou que cause uma violação destes Termos e Condições.
                </p>

                <p className="font-semibold">Política de Privacidade</p>

                <p>
                  <strong>13.</strong> Ao acessar este Site, informações específicas sobre o Usuário, como endereços de protocolo de Internet (IP), navegação no site, software do usuário e tempo de navegação, juntamente com outras informações semelhantes, serão armazenadas nos servidores de Salão do Ratinho. As informações sobre suas identidades, como nome, endereço, detalhes de contato, informações de faturamento e outras informações armazenadas neste site, serão estritamente usadas apenas para fins estatísticos e não serão publicadas para acesso geral. Salão do Ratinho, no entanto, não assume nenhuma responsabilidade pela segurança dessas informações.
                </p>

                <p>
                  <strong>14.</strong> O site é fornecido, com todas as responsabilidades e não assume compromissos, representações ou garantias expressas ou implícitas de qualquer tipo relacionadas a este site ou ao conteúdo nele contido.
                </p>

                <p className="font-semibold">Indenização</p>

                <p>
                  <strong>15.</strong> O usuário concorda em indenizar o Site e suas afiliadas em toda a extensão, frente à todas as ações, reclamações, responsabilidades, perdas, danos, custos, demandas e despesas decorrentes do uso deste Site pelo Usuário, incluindo, sem limitação, qualquer reclamação relacionada à violação de qualquer uma das disposições destes Termos e Condições. Se estiver insatisfeito com algum ou todo o conteúdo deste site ou qualquer um ou todos os seus Termos e Condições, o usuário pode interromper o uso deste site.
                </p>

                <p>
                  <strong>16.</strong> Em qualquer momento, os usuários podem interromper o uso do Site para isso, no site, estão disponíveis as orientações necessárias. Caso ainda fique algum dúvida, não hesite em enviar um e-mail para contato@salaodoratinho.com.br.
                </p>

                <p>
                  <strong>17.</strong> Nós nos reservamos o direito e critério exclusivo de, e sem aviso prévio ou responsabilidade, negar o acesso e uso do site (incluindo o bloqueio de endereços IP específicos) a qualquer usuário por qualquer motivo, incluindo, mas não se limitando à violação de qualquer representação, garantia ou acordo nestes Termos ou em qualquer lei ou regulamento aplicável.
                </p>

                <p className="font-semibold">Disposições Gerais</p>

                <p>
                  <strong>18.</strong> Os Termos e Condições deste site serão regidos e interpretados de acordo com as leis do país ou estado em que o Site opera. Você, por meio deste, se submete incondicionalmente à jurisdição não exclusiva dos tribunais localizados no Brasil para a resolução de quaisquer disputas.
                </p>

                <p>
                  <strong>19.</strong> Este Site reserva-se o direito de revisar estes Termos a qualquer momento conforme julgar adequado. Por isso é fundamental que os seus usuários estejam atentos à essas alterações.
                </p>

                <p>
                  <strong>20.</strong> O Site reserva-se o direito de ceder, transferir e subcontratar seus direitos e/ou obrigações sob este Acordo sem qualquer notificação ou consentimento prévio necessário. Os usuários não terão permissão para atribuir, transferir ou subcontratar qualquer um de seus direitos e/ou obrigações sob estes Termos. Além disso, uma pessoa que não seja parte destes Termos e Condições não terá o direito de fazer cumprir qualquer disposição neles contida.
                </p>

                <p>
                  <strong>21.</strong> Estes Termos e Condições, incluindo quaisquer avisos legais e isenções de responsabilidade neste site, constituem o acordo completo entre o Site e você em relação ao uso deste site. Em última análise, este Acordo substitui todos os acordos e entendimentos anteriores relativos ao mesmo.
                </p>

                <p>
                  <strong>22.</strong> Qualquer dúvida, entre em contato por meio do endereço de e-mail: contato@salaodoratinho.com.br.
                </p>
              </div>
            </AlertDialogDescription>
          </ScrollArea>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowFullTerms(false)}>
              Voltar
            </Button>
            <AlertDialogAction onClick={onAccept}>
              Li e Concordo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Termos de Uso</AlertDialogTitle>
          <AlertDialogDescription>
            Para continuar, você precisa aceitar nossos Termos de Uso. Deseja visualizar os termos completos?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFullTerms(true)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Termos
          </Button>
          <AlertDialogAction onClick={onAccept}>
            Concordo com os Termos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
