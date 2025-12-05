package entities;

public class Emplyoee {
	private String name;
	private Integer id;
	private Double salary;

	public Emplyoee(String name, Integer id, Double salary) {
		this.name = name;
		this.id = id;
		this.salary = salary;
	}
	public Emplyoee() {
		
	}
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Double getSalary() {
		return salary;
	}

	public void setSalary(Double salary) {
		this.salary = salary;
	}
	public void percentagem(Double percentagem) {
		salary += salary * percentagem / 100;
	}

	@Override
	public String toString() {
		return id +", " + name +", "+ String.format("%.2f%n", salary);
	}
	
}
