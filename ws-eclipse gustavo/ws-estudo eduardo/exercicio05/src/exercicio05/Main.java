package exercicio05;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
     Locale.setDefault(Locale.US);
      Scanner sc = new Scanner (System.in);
      
      int c = sc.nextInt();
      int p = sc.nextInt();
      double v = sc.nextDouble();
      
      int a = sc.nextInt();
      int b = sc.nextInt();
      double l = sc.nextDouble();
      double valor;
      //processamento
      
      valor = (p * v) + (b * l);
      
      System.out.println(" O Codigo do produto foi:"+a);
      System.out.println(" O Codigo do produto foi:"+c);
      System.out.printf("VALOR A PAGAR: R$ %.2f%n",valor);
      
         
      
      sc.close();
	}

}
