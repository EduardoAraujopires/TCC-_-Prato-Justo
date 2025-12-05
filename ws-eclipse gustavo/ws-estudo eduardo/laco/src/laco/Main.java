package laco;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		System.out.println(" 1 - Álcool");
		System.out.println(" 2 - Gasolina");
		System.out.println(" 3 - Diesel");
		System.out.println(" 4 - fim ");
		int Alcool=0;
		int gasolina =0;	
		int diesel=0;
	
		int x = sc.nextInt();
		while (x != 4 ) {
			
			if (x == 1) {
				System.out.println("Alcool");
			 Alcool +=  1;	
			} else if (x == 2){
				System.out.println("Gasolina");
				gasolina += 1;
			 }else if (x == 3) {
				System.out.println("Diesel");
				diesel += 1;
			
			}
			 x = sc.nextInt();
			
		}
		 System.out.println("Muito obrigado");
		 System.out.println("Alcool : "+ Alcool);
		 System.out.println("gasolina:"+ gasolina);
		 System.out.println("Diesel : "+diesel);
		
		sc.close();
	}
}
