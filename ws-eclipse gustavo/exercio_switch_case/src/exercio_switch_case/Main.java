package exercio_switch_case;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc = new Scanner(System.in);

		System.out.println("Digite sua idade");
		
		int idade = sc.nextInt();

		switch (idade) {

		case 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12:
			System.out.println("Criança");
			break;

		case 13, 14, 15, 16, 17:
			System.out.println("adolecente");
			break;

		default:
			
			if (idade >= 18 && idade < 60) {
				System.out.println("Adulto");
			} 
			else if (idade >= 60) {
				System.out.println("Idoso");
			}

			else {
				System.out.println("Fora de padrao");

			}

			break;

		}

		sc.close();
	}

}
