package application;

import java.util.Locale;
import java.util.Scanner;

import entities.Note;

public class progan {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		Note nt = new Note();
		
		nt.Name = sc.next();
		nt.N1 = sc.nextDouble();
		nt.N2 = sc.nextDouble();
		nt.N3 = sc.nextDouble();
		
		System.out.printf("FINAL GRADE = %.2f%n",nt.notaFinal());
		
		
		
		
		if (nt.notaFinal() < 60.0) {
			System.out.println("FAILED");
			System.out.printf("MISSING %.2f POINTS",nt.faltandoPonto());
		}
		else {
			System.out.println("PASS");
		}
		
		
		
		
		
		
		sc.close();

	}

}
