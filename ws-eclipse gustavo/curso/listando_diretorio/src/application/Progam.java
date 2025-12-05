package application;

import java.io.File;
import java.util.Scanner;

public class Progam {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		System.out.println("Digite o diretorio");
		String strPath = sc.nextLine();
		
		File path = new File(strPath);
		
		File[] folders = path.listFiles(File::isDirectory);
		
		for (File folder : folders) {
			System.out.println(folder);
		}
		
		
		
		
		
		sc.close();
	}

}
