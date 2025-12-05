package funcao;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		 System.out.println("Enter three numbers");
         int a =sc.nextInt();
         int b =sc.nextInt();
         int c =sc.nextInt();
      
         int number = max(a,b,c);
         showresult(number);
		sc.close();
	}
 //estou criando uma função
  
	public static int max(int x,int y,int z) {
		int aux;
		if(x > y && x > z) {
			aux = x;
		}else if (y >z) {
			aux = y;
		}else {
			aux = z;
		}
		return aux;
	}
	public static void showresult(int value) {
		System.out.println("number bigger:"+ value);
	}
}
