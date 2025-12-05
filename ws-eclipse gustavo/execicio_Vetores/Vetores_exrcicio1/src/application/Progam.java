package application;

import java.util.Locale;
import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
	Locale.setDefault(Locale.US);
	Scanner sc = new Scanner(System.in);
		
	int n;
	int qtdpares;
	System.out.print("Quantos numeros voce vai digitar? ");
	n = sc.nextInt();
	
	int[] vetor = new int[n];
	for (int i = 0; i < n ; i++) {
		System.out.print("Digite um numero: ");
		 vetor[i] = sc.nextInt();
	}
	
	System.out.println("\nNumeros de Pares:");
	
		qtdpares = 0;
	for (int i = 0; i < n ;i++) {
		if( vetor[i] % 2 == 0) {
			System.out.printf("%d ",vetor[i]);
			qtdpares ++;
			
	}
	System.out.printf("\n\nQuantidade de pares =%d\n",qtdpares);
		
	}
	
			
			
		
		sc.close();
	}

}
