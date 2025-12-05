package entities;

public class PessoaFisica extends Payers{
	 private Double gastoSaude;
	 
	 public PessoaFisica() {
	 }
	 
	public PessoaFisica(String name, Double rendaAnual, Double gastoSaude) {
		super(name, rendaAnual);
		this.gastoSaude = gastoSaude;
	}
	

	public Double getGastoSaude() {
		return gastoSaude;
	}

	public void setGastoSaude(Double gastoSaude) {
		this.gastoSaude = gastoSaude;
	}

	@Override
	public  Double tax() {
		if(getRendaAnual() < 20000.00) {
			return getRendaAnual() * 0.15 - gastoSaude * 0.5;
	}
		else {
			return getRendaAnual() * 0.25 - gastoSaude * 0.5;
		}
		}
	}


