package application;

import java.util.Locale;
import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);

		System.out.print("Quantas pessoas serao digitadas? ");
		int n = sc.nextInt();

		//criação dos vetores
		
		String[] nomes = new String[n];
		int[] idades = new int[n];
		double[] alturas = new double[n];
 
		for (int i = 0; i < n; i++) {
			System.out.println("Dados da " + (i + 1) + "a pessoa: ");
			//pedindo para os usuarios digitar os dados
			System.out.print("Nome: ");
			nomes[i] = sc.next();
			
			System.out.print("Idade: ");
			idades[i] = sc.nextInt();
			
			System.out.print("Altura: ");
			alturas[i] = sc.nextDouble();

		}
		//criando a variavel para receber a soma das alturas
		double soma = 0.0;
		for (int i = 0; i < n; i++) {
			soma = soma + alturas[i];
		}

		double somaAltura = soma / n;

		System.out.println();
		System.out.printf("Altura média: %.2f%n", somaAltura);

		
		//criando a variavel para receber a soma das idades
		int cont = 0;
		for (int i = 0; i < n; i++) {
			if (idades[i] < 16) {
				cont = cont + 1;
			}
		}
		
		// variavel responsavel pela porcentagem das idades
		double porcentagem = cont * 100.0 / n;
		System.out.printf("Pessoas com menos de 16 anos: %.1f%%%n ", porcentagem);
		
		// mostrando os nomes dos usuario que tem a idade menor que 16
		for (int i = 0; i < n; i++) {
			if (idades[i] < 16) {
				System.out.println(nomes[i]);
			}
		}

		sc.close();
	}

}
