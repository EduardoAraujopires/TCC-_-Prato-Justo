package media;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
	Locale.setDefault(Locale.US);
	  Scanner sc = new Scanner(System.in);
	   //ENTRADA DE DADOS 
	    double A,B,C,TRIANGULO,CIRCULO,TRAPEZIO,QUADRADO,RETANGULO;
		 A = sc.nextDouble();
		 B = sc.nextDouble();
		 C = sc.nextDouble();
		 //PROCESSAMENTO
		 TRIANGULO = (A*C)/2.0;
		 CIRCULO = 	(3.14159 *C *C );
		 TRAPEZIO = (A+B)/2.0 * C;
		 QUADRADO = B * B;
		 RETANGULO = A*B;
		 //SAÍDA DE DADOS
		 System.out.printf("TRIANGULO: %.3f%n",TRIANGULO);
		 System.out.printf("CIRCULO: %.3f%n",CIRCULO);
		 System.out.printf("TRAPEZIO: %.3f%n",TRAPEZIO);
		 System.out.printf("QUADRADO: %.3f%n",QUADRADO);
		 System.out.printf("RETANGULO: %.3f%n",RETANGULO);
		sc.close();
	}
}
