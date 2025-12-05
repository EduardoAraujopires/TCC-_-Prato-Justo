package problema_exemplo;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		String resp;
		resp = "sim";
		 while (resp == "sim" ) {
			 
		System.out.println("Escolha uma opcao do menu!!!");
		
		Scanner sc = new Scanner(System.in);
		int r = 0;
		System.out.println(" 1 - SOMA");
		System.out.println(" 2 - SUBTRACAO");
		System.out.println(" 3 - MULTIPLICAO");
		System.out.println(" 4 - DIVISAO");
		
		int n = sc.nextInt();
		
		System.out.println("digite um numero ");
		int x = sc.nextInt();

		System.out.println("digite o segundo numero ");
		int y = sc.nextInt();

		switch (n) {
		case 1:
			System.out.println("OPCAO ESCOLHIDA: SOMA !!!");
			r = (x + y);
			System.out.println("Resultado : " + x + " + " + y + " = " + r);
			break;
		case 2:
			System.out.println("OPCAO ESCOLHIDA: SUBTRACAO !!!");
			r = (x - y);
			System.out.println("Resultado : " + x + " - " + y + " = " + r);
			break;
		case 3:
			System.out.println("OPCAO ESCOLHIDA: MULTIPLICAO!!!");
			r = (x * y);
			System.out.println("Resultado : " + x + " x " + y + " = " + r);
			break;
		case 4:
			System.out.println("OPCAO ESCOLHIDA: DIVISAO !!!");
			r = (x / y);
			System.out.println("Resultado : " + x + " / " + y + " = " + r);
			break;
		default:
			System.out.println("escolha errada do menu!!");
		}
		 
		sc.close();
		   System.out.println("Desejaa fazer outro calculo <sim/nao> "+resp);
		 }	     
	}
}
