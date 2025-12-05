package menu;
import java.util.Scanner;
public class Main {

	public static void main(String[] args) {
		Scanner sc =new Scanner(System.in);
		char resp = 's';
		 while(resp != 'n') {
		System.out.println("******************************");
		System.out.println("*                             *");
		System.out.println("*          MENU               *");
		System.out.println("*                             *");
		System.out.println("*******************************");
	    System.out.println("        1 - calculo de nota   *");
	    System.out.println("*       2 - reajuste salario  *");
	    System.out.println("*       3 - NUMERO ANTECESSOR *");
	    System.out.println("*       4 - NUMERO SUCESSOR   *");
	    System.out.println("*       5 - CALCULO DE IDADE  *");
	    System.out.println("*       6 - SAIR              *");
	    System.out.println("*******************************");
	    System.out.println("Digite um numero do menu !!");
	     int x =sc.nextInt();
	     switch (x) {
			case 1:
				// entrada de dados
				System.out.println("Calculo de nota");
				System.out.println("Digite a nota do Primeiro bimeste");
				int n1 = sc.nextInt();
				System.out.println("Digite a nota do Segundo bimeste");
				int n2 = sc.nextInt();
				System.out.println("Digite a nota do Terceiro bimeste");
				int n3 = sc.nextInt();
				System.out.println("Digite a nota do Quarto bimeste");
				int n4 = sc.nextInt();
				int media;
				media = (n1 + n2 + n3 + n4) / 4;
				System.out.println("Media: " + media);
				if (media >= 7) {
					System.out.println("Aprovado");
				} else if (media >= 5 && media == 6) {
					System.out.println("Recuperacao");
				} else {
					System.out.println("Reprovado");
				}
				 break;
			case 2:
				System.out.println("Reajuste Salarial");
				System.out.println("Digite seu salario atual");
				double sat = sc.nextDouble();
				System.out.println("Digite o Reajuste salarial");
				double reajuste = sc.nextDouble();
				double sn;
				sn = (sat * reajuste);
				System.out.println("Salario Antigo: " + sat);
				System.out.printf("Salario novo: %.1f%n", sn);
				System.out.printf("Valor Reajuste: %.1f%n ", reajuste);
				break;
			case 3:
				System.out.println("Numero Antecessor");
				System.out.println("Digite um numero ");
				int n = sc.nextInt();
				int ANTECESSOR = n - 1;
				System.out.println("Resultado : " + ANTECESSOR);
				break;
			case 4:
				System.out.println("Numero Sucessor");
				System.out.println("Digite um numero");
				int s = sc.nextInt();
				int SUCESSOR = (s + 1);
				System.out.println("Resulatado: " + SUCESSOR);
				break;
			case 5:
				System.out.println("Calculo de idade");
				System.out.println("Digite o ano atual");
				int ant = sc.nextInt();
				System.out.println("Digite sua data de nascimento");
				int nas = sc.nextInt();
				int idade = (ant - nas);
				System.out.println("Idade Atual: " + idade);
				break;
			case 6:
				System.out.println("Obrigado por usar o menu");
				break;
			default:
				System.out.println("Digite uma opcao valida");
				break;
			}
			System.out.println("Deseja fazer outro calculo <s/n>");
			resp = sc.next().charAt(0);
			if (resp == 's') {
				System.out.println("obrigado por continuar !!");
			} else {
				System.out.println("obrigado por usar o menu !!");
			}
		}
		sc.close();
	}

	}
