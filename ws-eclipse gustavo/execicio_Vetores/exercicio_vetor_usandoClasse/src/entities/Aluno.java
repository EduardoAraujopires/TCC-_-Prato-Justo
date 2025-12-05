package entities;

public class Aluno {
	private String nome;
	private int idade;
	private double NotaFinal;

	public Aluno(String nome, int idade, double notaFinal) {
		this.nome = nome;
		this.idade = idade;
		NotaFinal = notaFinal;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public int getIdade() {
		return idade;
	}

	public void setIdade(int idade) {
		this.idade = idade;
	}

	public double getNotaFinal() {
		return NotaFinal;
	}

	public void setNotaFinal(double notaFinal) {
		NotaFinal = notaFinal;
	}

	@Override
	public String toString() {
		return "Aluno: \n" + nome
			   +"idade: \n" + idade 
			   +"NotaFinal \n" + NotaFinal;
	}

}
