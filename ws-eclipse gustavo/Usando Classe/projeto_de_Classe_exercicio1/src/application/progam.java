package application;

import java.util.Locale;
import java.util.Scanner;

import entidades.Rectangle;

public class progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner (System.in);
		
		Rectangle rect = new Rectangle();
		
		System.out.println("Enter rectangle width and height: ");
		rect.height = sc.nextDouble();
		rect.width  = sc.nextDouble();
		
				
		System.out.printf("Area =  %.2f%n", rect.area());
		
		System.out.printf("Perimeter = %.2f%n", rect.perimeter());
		
		System.out.printf("Diagonal = %.2f%n", rect.Diagonal());
		
		sc.close();

	}

}
