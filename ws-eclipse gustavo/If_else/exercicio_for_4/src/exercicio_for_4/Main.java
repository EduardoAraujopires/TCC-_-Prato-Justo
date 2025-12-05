package exercicio_for_4;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc = new Scanner(System.in);
		Locale.setDefault(Locale.US);
		double n = sc.nextDouble();


		
		for (int i = 0; i < n;i++) {
			int x = sc.nextInt();
			int y = sc.nextInt();
			
			if (y == 0) {
				System.out.println("Divisao impossivel");
		}
		
		else{
			double resp = (double) x / y;
			System.out.printf("%.1f%n",resp);
		}
		}
		sc.close();
	}

}
