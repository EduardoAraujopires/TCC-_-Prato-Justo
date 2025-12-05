package application;

import java.util.Scanner;

import entites.Funcionario;

public class Progam {

	public static void main(String[] args) {
		Funcionario funcio = new Funcionario ();
		Scanner sc = new Scanner(System.in);
		String Cargo = 0;
		System.out.println("Digite seu nome: ");
		funcio.nome = sc.nextLine();
		System.out.println("Digite seu cargo: ");
		funcio.cargo = sc.next(Cargo);
		
		
		
		
		
		
		
		
		
		sc.close();
	}

}
