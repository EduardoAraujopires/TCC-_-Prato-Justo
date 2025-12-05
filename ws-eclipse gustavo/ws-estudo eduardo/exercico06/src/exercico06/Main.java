package exercico06;

import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);	
    Scanner sc = new Scanner(System.in);
    int f = sc.nextInt();
    int h = sc.nextInt();
    double v = sc.nextDouble();
     double salario;
    salario = (h * v);
    System.out.println("Numero do funcionario "+f);
    System.out.printf("Salario = U$ %.2f%n ",salario);
    sc.close();
	}
}
