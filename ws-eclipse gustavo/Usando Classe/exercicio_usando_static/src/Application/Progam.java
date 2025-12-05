package Application;

import java.util.Locale;
import java.util.Scanner;

import Entidades.Cotacao;

public class Progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		System.out.print("QUAL O PRECO DO DOLLAR: ");
		double preco_dollar = sc.nextDouble();
		System.out.print("Quantos dólares serão comprados? ");
		double quantidade = sc.nextDouble();
		double resultado = Cotacao.dollar_em_real(quantidade, preco_dollar);
		System.out.printf("Valor a pagar em reais =  %.2f%n",resultado);
		
		
		
		
		
		
		
		
		
		
		
		sc.close();
	}

}
