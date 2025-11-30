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

interface PrivacyPolicyDialogProps {
  open: boolean;
  onAccept: () => void;
}

export function PrivacyPolicyDialog({ open, onAccept }: PrivacyPolicyDialogProps) {
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  if (showFullPolicy) {
    return (
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Política de Privacidade</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4">
                <p>
                  <strong>1.</strong> Esta Política de Privacidade se refere aos dados pessoais que o(a) Salão do Ratinho poderá obter quando seus Usuários utilizam dos serviços prestados durante a navegação dentro de nosso ambiente virtual. Nesta Política de Privacidade, será descrita de que forma serão coletados e armazenados dados a respeito dos Usuários, assim como a forma pela qual tais dados poderão ser utilizados e armazenados nos termos da Lei 12.965/2014 ("Marco Civil da Internet"), do Decreto 8.771/2016 e da Lei n.º 13.709/2018 (Lei Geral de Proteção de Dados).
                </p>

                <p>
                  Ao aceitar a presente Política de Privacidade é declarado que todo seu conteúdo foi devidamente lido e aceito, tendo assim todas as cláusulas devidamente validadas pelo Usuário para que atuem em pleno vigor.
                </p>

                <p>
                  Ademais, deixa claro que esta Política de Privacidade poderá ser atualizada a qualquer tempo, a exclusivo critério dos administradores do ambiente virtual aqui discutido. Porém, deixa claro que toda e qualquer comunicação será devidamente comunicada aos Usuários para nova aceitação de modo de que, caso continuem em utilizar os serviços providenciados, estarão automaticamente concordando com as alterações realizadas no corpo desta política.
                </p>

                <p className="font-semibold">2. Obtenção, Armazenamento e Cuidado dos dados pessoais coletados</p>

                <p>
                  Aceitando nossa política de Privacidade, fica concedido, por livre e espontânea vontade, permissão para a coleta e armazenamento dos dados pessoais dos Usuários, que serão tratados da forma abaixo descrita:
                </p>

                <ul className="list-disc pl-6 space-y-1">
                  <li>Poderão ser coletados informações fornecidas no cadastro ao longo do uso dos Serviços e durante a sua navegação em nossa plataforma.</li>
                  <li>Eventuais dados de navegação serão utilizados para possibilitar o seu acesso e saber como entrar em contato com o Usuário quando for necessário. Além de utilizados para compreender seus interesses, como forma de garantir constante melhoria e evolução dos serviços providenciados.</li>
                  <li>Os dados pessoais, poderão ser armazenados em outros países onde o(a) Salão do Ratinho ou suas afiliadas possuam presença. Caso tais jurisdições possuam diferentes leis de proteção de dados, fica estabelecido o compromisso de armazenar e cuidar dos dados de acordo com tais leis e a presente Política de Privacidade.</li>
                  <li>Os Dados pessoais poderão ser utilizados de forma anônima para fins estatísticos e de controle e melhora dos nossos serviços.</li>
                  <li>Serão estabelecidas medidas de segurança razoáveis para proteger todos os dados pessoais providenciados. Entretanto, lembramos que não existe uma medida de segurança 100% eficaz.</li>
                  <li>Eventualmente, todos os dados coletados pelo Usuário durante o uso dos serviços prestados, poderão ser excluídos ao momento em que o Usuário desejar, dito isso, somos obrigados a manter os registros de conexão durante o prazo legal.</li>
                  <li>Esta Política de Privacidade se aplica a todos os websites detidos pelo(a) Salão do Ratinho ou qualquer outra página, mídia social, ferramenta, software ou conteúdo de sua propriedade.</li>
                </ul>

                <p>
                  O site coleta dados pessoais exclusivamente para fins de agendamento, contato e melhoria da experiência do usuário. Os dados coletados incluem: nome, telefone, e-mail, informações de agendamento (serviço escolhido, data e horário) e dados de navegação (endereço IP, tipo de navegador e páginas acessadas).
                </p>

                <p>
                  Esses dados são utilizados para processar e confirmar agendamentos, prestar atendimento ao cliente, enviar notificações relacionadas aos serviços e gerar estatísticas internas para aprimorar o site. Não realizamos venda ou compartilhamento não autorizado desses dados.
                </p>

                <p>
                  <strong>3.</strong> O fato de usar o site e/ou serviço disponibilizado confirma o consentimento inequívoco e incondicional do Usuário com esta Política, incluindo os termos de processamento de seus dados pessoais. Na ausência de consentimento do usuário com esta política e os termos de processamento de seus dados pessoais, o Usuário deve parar de usar o site e/ou o serviço providenciados, reservando à administração o direito de impedir o acesso do referido Usuário.
                </p>

                <p>
                  <strong>4.</strong> Este ambiente é destinado a usuários com 18 (dezoito) anos de idade ou mais. Se você tem menos de 18 (dezoito) anos, não poderá usar ou registrar-se para usar este site ou seus serviços sem a permissão ou consentimento dos pais. Ao concordar com esta política de Privacidade, você tem a capacidade legal necessária para cumprir e ficar vinculado por esta política de Privacidade.
                </p>

                <p className="font-semibold">5. Armazenamento de Informações</p>

                <p>
                  É reconhecida a natureza sensível e confidencial dos dados e demais informações obtidas e armazenadas. Assim fica estabelecido o compromisso de manter estas informações de natureza confidencial em sigilo, sem utilizá-las ou divulgá-las sem a autorização do Usuário, exceto nos termos previstos nos Termos de Uso e na Política de Privacidade, bem como nos limites necessários para a execução das obrigações contratuais e legais, assim como para a defesa dos interesses do(a) Salão do Ratinho e dos Usuários.
                </p>

                <p className="font-semibold">6. Cuidado com as informações e uso de Cookies</p>

                <p>
                  O Usuário concorda que o(a) Salão do Ratinho poderá coletar, registrar, organizar, acumular, armazenar, atualizar, extrair, usar, transferir, incluindo transferência para outros países onde possua parceiros e/ou afiliadas, remover e destruir dados pessoais e outras informações.
                </p>

                <p>
                  <strong>7.</strong> Os atos descritos acima poderão ser processados de forma manual e/ou com o uso de automação. O presente consentimento é válido até a sua retirada das configurações do Usuário e/ou até que seja solicitado pelo Usuário de forma direta. A solicitação pode ser enviada por escrito para o endereço eletrônico: contato@salaodoratinho.com
                </p>

                <p>
                  <strong>8.</strong> Dentro dos limites da legislação aplicável, o(a) Salão do Ratinho tem o direito de transferir as informações fornecidas pelo Usuário para terceiros.
                </p>

                <p>
                  <strong>9.</strong> No tratamento de dados pessoais, serão tomadas as medidas legais, técnicas e organizacionais necessárias para proteger os dados pessoais contra o acesso não autorizado ou acidental, destruição, modificação, bloqueio, cópia, disposição, distribuição de dados pessoais, bem como outras ações ilegais em relação a dados pessoais em cumprimento dos requisitos da legislação brasileira e/ou qualquer outra que venha a ser aplicável. O Usuário concorda que algumas das informações, incluindo dados pessoais, ficam disponíveis publicamente ao usar determinados serviços e/ou o site.
                </p>

                <p>
                  <strong>10.</strong> Salão do Ratinho faz uso de cookies. Ao acessar nosso site, você concorda em usar cookies nos termos da nossa Política de Cookies. Salienta-se que algum dos nossos parceiros de site podem usar cookies.
                </p>

                <p className="font-semibold">11. Manutenção dos dados pelo Usuário</p>

                <p>
                  O usuário tem o direito de requerer a exclusão de seus dados pessoais coletados durante o uso do ambiente eletrônico disponibilizado a qualquer momento, utilizando-se serviço relevante disponibilizado pelo próprio ambiente, ou por meio de contato direto com a administração por meio do endereço eletrônico disponibilizado acima. Estes direitos podem ser restringidos da maneira prescrita pela legislação brasileira.
                </p>

                <p>
                  <strong>12.</strong> Caso o Usuário tenha ciência de que seus dados pessoais tenham sido comprometidos, de forma que poderá afetar seu acesso ao ambiente eletrônico providenciado, ele deverá comunicar imediatamente a administração para que sejam tomadas todas as medidas de segurança necessárias.
                </p>

                <p>
                  <strong>13.</strong> O Usuário é o único responsável por suas ações relacionadas ao uso do site e/ou serviços disponibilizados, significando que, se tais ações resultarem em violação dos direitos e interesses legítimos de terceiros, bem como descumpre com a legislação do Brasil, o Usuário concorda em indenizar os prejuízos causados ao(à) Salão do Ratinho e/ou terceiros como resultado da não execução ou má execução das obrigações do Usuário sob esta Política e/ou a legislação.
                </p>

                <p className="font-semibold">Responsabilidades e Competências</p>

                <p>
                  <strong>14.</strong> O Usuário usa os Serviços por sua conta e risco, sendo o único responsável por perdas incorridas como resultado do mal-uso pelo do ambiente e/ou dos serviços da Empresa.
                </p>

                <p>
                  <strong>15.</strong> O(A) Salão do Ratinho coopera com as autoridades competentes e com terceiros para garantir o cumprimento das leis, salvaguardar a integridade e a segurança da Plataforma e de seus usuários, e impedir condutas que prejudiquem a integridade moral e a honra das pessoas físicas ou jurídicas envolvidas.
                </p>

                <p>
                  <strong>16.</strong> As disposições desta Política são regidas pelas leis do Brasil. Se, por uma razão ou outra, uma ou mais disposições desta Política forem consideradas inválidas, isso não afeta as demais disposições.
                </p>

                <p>
                  <strong>17.</strong> Para todas as questões o Usuário pode enviar um pedido para o endereço da empresa para a seguinte conta: contato@salaodoratinho.com.
                </p>
              </div>
            </AlertDialogDescription>
          </ScrollArea>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowFullPolicy(false)}>
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
          <AlertDialogTitle>Política de Privacidade</AlertDialogTitle>
          <AlertDialogDescription>
            Para continuar usando o aplicativo, você precisa aceitar nossa Política de Privacidade. Deseja visualizar a política completa?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFullPolicy(true)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Política
          </Button>
          <AlertDialogAction onClick={onAccept}>
            Concordo com a Política
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
