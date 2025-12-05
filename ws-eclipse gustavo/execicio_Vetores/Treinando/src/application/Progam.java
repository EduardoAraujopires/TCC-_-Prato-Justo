package application;

import java.util.Locale;
import java.util.Scanner;

public class Progam {
	public static void main(String[] args) {
	Locale.setDefault(Locale.US);
	Scanner sc = new Scanner(System.in);
	
	System.out.print("Quantos numeros será digitado? ");
	int n = sc.nextInt();
	double soma = 0 , media = 0;
	
	double vect[] = new double[n];
	for(int i = 0; i<n;i++) {
		System.out.print("Digite um numero: ");
		vect[i] = sc.nextDouble();
		
	}
		for(int i = 0; i<n;i++) {
			 soma = soma + vect[i];
			
		}
		media = soma / n;
	
		System.out.print("VALORES = ");
		for(int i = 0; i<n;i++) {
			System.out.printf("%.1f ", vect[i]);
		}
		System.out.printf("\nSOMA = %.2f\n",soma);
		System.out.printf("MEDIA = %.2f\n",media);
		
		
	sc.close();
	}
}
