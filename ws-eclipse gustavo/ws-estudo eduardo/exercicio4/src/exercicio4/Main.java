package exercicio4;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		int a = sc.nextInt();
		int x = sc.nextInt();
		double y = sc.nextDouble();
		double salario;
		salario = (x * y);
		
		System.out.println("numero : "+a);
		System.out.printf("Salario = U$ %.2f%n",salario);
		
		
		sc.close();
	}

}
