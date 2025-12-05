package entities;

public class Note {
	
	public String Name;
	public double N1;
	public double N2;
	public double N3;


	public double notaFinal(){
		return  N1 + N2 + N3;
	}
	
	public double faltandoPonto(){
		if (notaFinal() < 60.0) {
			return 60.0 - notaFinal();
		}
		else {
			return 0.0;
		}
	}
	
	
	
	
	
}
