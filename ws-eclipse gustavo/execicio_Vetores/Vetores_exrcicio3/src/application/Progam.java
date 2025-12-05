package application;

import java.util.Locale;
import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		int n,nmenores;
		double alturatotal,alturamedia,percentualMenores;
		System.out.print("Quantas pessoas será digitadas? ");
		n = sc .nextInt();
		String[] nome = new String[n];
		int[] idade = new int[n];
		double[] altura = new double[n];
		
		
		for(int i = 0; i < n; i++) {
			System.out.printf("Dados da %d pessoas%n", i + 1);
			
			System.out.print("Nome: ");
			nome[i] = sc.next();
			
			System.out.print("Idade ");
			idade[i] = sc.nextInt();
			
			System.out.print("Altura: ");
			altura[i] = sc.nextDouble();
		}
				
		nmenores = 0;
		alturatotal = 0;
		for(int i = 0; i < n; i ++){
			if(idade[i] < 16) {
				nmenores ++;
			}
			alturatotal = alturatotal + altura[i];
		}
		alturamedia = alturatotal /n;
		percentualMenores = ((double)nmenores / n) * 100.0;
		
		System.out.printf("\naltura media = %.2f\n", alturamedia);
		System.out.printf("Pessoas com menos de 16 anos: %.1f%%\n",percentualMenores);
		
		for(int i = 0; i<n; i++) {
			if (idade[i] < 16) {
				System.out.printf("%s\n", nome[i]);
			}
		}
		
		
		
		
		sc.close();
	}

}
