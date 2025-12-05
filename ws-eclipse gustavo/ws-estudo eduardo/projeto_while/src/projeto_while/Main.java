package projeto_while;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		int gasolina = 0;
		int alcool = 0;
		int diesel = 0;
		System.out.println(" 1- Álcool");
		System.out.println(" 2- Gasolina");
		System.out.println(" 3- Diesel");
		System.out.println(" 4- Sair");
		System.out.println("Digite um numero do menu");
		int x = sc.nextInt();
		while (x != 4) {
			if (x == 1) {
			 alcool += 1;
			} else if (x == 2) {
				gasolina += 1;
			} else if (x == 3) {
				 diesel+= 1;
			}else {	
				System.out.println("Muito obrigado");
				
			}
	
			x = sc.nextInt();
		}

		System.out.println(" Álcool : " + alcool);
		System.out.println(" Gasolina : " + gasolina);
		System.out.println(" Diesel :" + diesel);

		sc.close();
	}

}
