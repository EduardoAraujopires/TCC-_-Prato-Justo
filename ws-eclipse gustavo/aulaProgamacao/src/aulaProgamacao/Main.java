package aulaProgamacao;

import java.util.Locale;

public class Main {

	public static void main(String[] args) {
		
		
		String Produto1 = "Computador";
		String Produto2 = "Mesa De Escritorio";
		
		int idade = 30;
		int codigo = 5290;
		
		char genero = 'F';
		
		double Preco1 = 2100.0;
		double Preco2 = 650.50;
		double medir = 53.234567;
		
		Locale.setDefault(Locale.US);
     
		
		
		
		System.out.println("Segue a lista de produtos:");
		System.out.printf("%n%s, Apartir de R$ %.2f Reais%n",Produto1,Preco1);
		System.out.printf("%s, apartir de R$ %.2f Reais%n",Produto2,Preco2);
		
		System.out.printf("%nRegistro: %d anos, codigo %d e genero: %s%n",idade,codigo,genero);
		
		System.out.printf("%nMedir com oito decimal por favor: %.8f %n",medir);
		System.out.printf("Medir com (Tres decimal por favor): %.3f %n",medir);
		
		System.out.printf("Medir usando a localização de US: %.3f %n",medir);
		 
	
	
	}
	
	
	} 
