package Entidades;

public class Cotacao {
	public static double IOF = 0.06;

	public static double dollar_em_real(double quantia,double preco_dollar) {
		return quantia * preco_dollar *(1.0 + IOF);
	}
}

