package application;

import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
	
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Quantos numeros voce vai digitar? ");
		int n = sc.nextInt();
		
		int[] numero = new int [n];
		
		for(int i = 0; i<n; i++) {
			System.out.print("Digite um numero: ");
			numero[i] = sc.nextInt();
			
		}
		System.out.printf("NUMEROS PARES: %n");
		
		int qtdpares = 0;
		for(int i = 0; i<n; i++) {
			if(numero[i] %2 ==0) {	
				System.out.printf("%d ", numero[i]);
				qtdpares++;
			}

		}
		
		System.out.printf("%nQUANTIDADE DE PARES = "+ qtdpares);
		
		
		
		
		sc.close();
	}

}
