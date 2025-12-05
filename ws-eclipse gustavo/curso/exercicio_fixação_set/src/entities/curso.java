package entities;

import java.util.Objects;

public class curso {
	private Integer numeroStudents;

	public curso() {
	}

	public curso(Integer numeroStudents) {
		super();
		this.numeroStudents = numeroStudents;
	}

	public Integer getNumeroStudents() {
		return numeroStudents;
	}

	public void setNumeroStudents(Integer numeroStudents) {
		this.numeroStudents = numeroStudents;
	}

	@Override
	public int hashCode() {
		return Objects.hash(numeroStudents);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		curso other = (curso) obj;
		return Objects.equals(numeroStudents, other.numeroStudents);
	}

}
