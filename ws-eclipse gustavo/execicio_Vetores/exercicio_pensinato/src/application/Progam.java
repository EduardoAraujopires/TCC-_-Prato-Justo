package application;

import java.util.Scanner;

import entities.Rent;

public class Progam {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Quantos quartos será alugados? ");
		int n = sc.nextInt();
		
		Rent[] vect = new Rent[10];
		
		String nome,email;	 
		int quarto;
			
			
		for(int i = 1; i < n; i++) {
			System.out.println();
			
			System.out.println("Aluguel #" + i + ":");
			System.out.print("Nome: ");
			sc.nextLine();
			nome = sc.nextLine();
			System.out.print("Email: ");
			email = sc.next();
			System.out.print("Quarto: ");
			quarto = sc.nextInt();
			
			vect[quarto] = new Rent(nome, email);
		}
 
		System.out.println();
		System.out.println("Quartos ocupados: ");
		for(int i = 0; i < 10; i++) {
			if(vect[i] != null) {
				System.out.println(i + ": " + vect[i]);
			}
		}
		
		
		sc.close();
	}

}
