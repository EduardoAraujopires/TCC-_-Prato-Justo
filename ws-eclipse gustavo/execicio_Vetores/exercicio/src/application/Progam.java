package application;

import java.util.Locale;
import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Quantos elementos vai ter o vetor? ");
		int n = sc.nextInt();

	    double soma, media;
		
		double[] numero = new double[n];
		
		for(int i = 0; i<n;i++) {
			System.out.print("Digite um numero: ");
			numero[i] = sc.nextDouble();
		}
		soma = 0;
		for(int i = 0; i<n;i++) {
			soma = soma + numero[i];
		}
		
		media = soma / n;
		System.out.println();
		System.out.printf("MEDIA DO VETOR = %.3f%n", media);
		System.out.print("ELEMENTOS ABAIXO DA MEDIA: \n");
		
		for(int i = 0; i<n;i++) {
			if(numero[i]< media) {
				System.out.println(numero[i]);
			}
		}
		
		
		sc.close();
	}

}
