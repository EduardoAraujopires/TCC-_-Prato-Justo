package entities;

public class ImportedProduct extends Product {
	private Double customsfee;

	public ImportedProduct() {
	}

	public ImportedProduct(String name, Double price, Double customsfee) {
		super(name, price);
		this.customsfee = customsfee;
	}

	public Double getCustomsfee() {
		return customsfee;
	}

	public void setCustomsfee(Double customsfee) {
		this.customsfee = customsfee;
	}

	public Double totalprice() {
		return getPrice() + customsfee;
	}
	@Override
	public String priceTag() {
		return getName() + 
				" $" 
				+ String.format("%.2f", totalprice())
				+ " ("+"Customs fee: $ "+ String.format("%.2f", customsfee) +")";
	}

}
