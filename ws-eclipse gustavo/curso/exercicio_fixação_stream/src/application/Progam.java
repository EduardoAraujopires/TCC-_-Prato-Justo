package application;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;
import java.util.stream.Collectors;

import entities.Employee;

public class Progam {

	public static void main(String[] args) {
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Entre com o caminho da pasta: ");
		String path = sc.nextLine();
		
		try(BufferedReader br = new BufferedReader(new FileReader(path))){
			List<Employee> list = new ArrayList<>();
			String linhas = br.readLine();			
			
			while(linhas != null) {
				String[] vetor = linhas.split(",");
				String nome = vetor[0];
				String email = vetor[1];
				Double salario = Double.parseDouble(vetor[2]);
						
				linhas = br.readLine();
				
				Employee employee = new Employee(nome, email, salario);
				list.add(employee);
				
			}

			System.out.print("Digite o salario: ");
			Double mediaSalarial = sc.nextDouble();
			
			List<String> email = list.stream()
					.filter(x -> x.getSalary() > mediaSalarial)
					.map(x -> x.getEmail())
					.sorted()
					.collect(Collectors.toList());
			
			System.out.println("Email de pessoas cujo o salario é maior que " +String.format("%.2f", mediaSalarial ) + ":" );
			email.forEach(System.out :: println);
			
			double sum = list.stream()
					.filter(x -> x.getName().charAt(0) == 'M')
					.map(x -> x.getSalary())
					.reduce(0.0, (x, y) -> x + y);
			
		System.out.println("Soma dos salario de pessoas cuja o nome começa com 'M': " + String.format("%.2f", sum));
			
		}catch(IOException e) {
			System.out.println("ERRO: "+ e.getMessage());
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		sc.close();
	}

}
