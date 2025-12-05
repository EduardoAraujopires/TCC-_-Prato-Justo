package entities;

public class PessoaJuridica extends Payers {
	
	private Integer employees;

	public PessoaJuridica() {
	}
	
	public PessoaJuridica(String name, Double rendaAnual, Integer employees) {
		super(name, rendaAnual);
		this.employees = employees;
	}

	public Integer getEmployees() {
		return employees;
	}

	public void setEmployees(Integer employees) {
		this.employees = employees;
	}

	@Override
	public Double tax() {
		if(employees > 10) {
			return getRendaAnual() * 0.14;
		}
		else {
			return getRendaAnual() * 0.16;
		}
	}
	
	
}
