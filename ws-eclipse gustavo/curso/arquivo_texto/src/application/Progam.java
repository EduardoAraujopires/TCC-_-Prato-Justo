package application;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class Progam {

	public static void main(String[] args) {
		
		String[] lines = new String[] {"Bom Dia " , "Boa Tarde ", "Boa Noite"};
		String path = "c:\\TEMP\\out.text";
		
		
		try(BufferedWriter bwf = new BufferedWriter(new FileWriter(path, true))){
			for(String line : lines) {
				
				bwf.write(line);
				bwf.newLine();
			}
		}catch (IOException e) {
			e.printStackTrace();
		}
	}

}
