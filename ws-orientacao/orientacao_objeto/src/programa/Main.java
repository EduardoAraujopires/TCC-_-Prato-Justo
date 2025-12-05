package programa;

import entidade.Triangle;
import java.util.Locale;
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		Triangle x, y;
		x = new Triangle();
		y = new Triangle();
		System.out.println("digite os valores dos lados x");
		x.a = sc.nextDouble();
		x.b = sc.nextDouble();
		x.c = sc.nextDouble();
		System.out.println("digite os valores dos lados y");
		y.a = sc.nextDouble();
		y.b = sc.nextDouble();
		y.c = sc.nextDouble();

		double areaX = x.area();
		double areaY = y.area();
		System.out.printf("Valor da area X: %.4f%n", areaX);
		System.out.printf("Valor de area Y: %.4f%n", areaY);
		if (areaX > areaY) {
			System.out.println("Area Maior : X");
		} else {
			System.out.println("Area Maior : Y");
		}
		sc.close();
	}

}
