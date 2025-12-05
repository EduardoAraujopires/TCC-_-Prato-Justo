package exercio2;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Locale.setDefault(Locale.US);
      Scanner sc = new Scanner (System.in);
      
      double x = sc.nextDouble();
      double y = 3.14159;
      double A = y * x * x;
      
      System.out.printf("A = %.4f%n",A);   
      
      sc.close();
	}

}
