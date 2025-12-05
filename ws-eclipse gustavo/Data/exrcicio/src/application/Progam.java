package application;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Scanner;

import entities.Department;
import entities.HourContract;
import entities.Worker;
import entitiesEnums.WorkerLevel;

public class Progam {

	public static void main(String[] args) throws ParseException {
		
		Locale.setDefault(Locale.US);
		Scanner sc = new Scanner(System.in);
		
		SimpleDateFormat data = new SimpleDateFormat("dd/MM/yyyy");
		
		System.out.print("Enter department's name: ");
		String DepartmentName = sc.nextLine();
		System.out.println("Enter worker data:");
		System.out.print("Name: ");
		String workerName = sc.next();
		System.out.print("Level: ");
		String workerLevel = sc.next();
		System.out.print("Base Salary: ");		
		double baseSalary = sc.nextDouble();
		
		Worker worker = new Worker(workerName, WorkerLevel.valueOf(workerLevel), baseSalary, new Department(DepartmentName));
		
		
		System.out.print("How many contracts to this worker? ");
		int NumeroContracts = sc.nextInt();
		
		for (int i = 1; i < NumeroContracts; i++) {
			System.out.println("Enter conntract #"+ i + " data: ");
			System.out.print("Date (DD/MM/YYYY): ");
			Date contractDate =  data.parse(sc.next());
			System.out.print("Value per hour: ");
			double ValueHour = sc.nextDouble();
			System.out.print("Duration (hours): ");
			int duration = sc.nextInt();
			HourContract contract = new HourContract(contractDate,ValueHour,duration);
			worker.addContract(contract);			
		}
		
		System.out.println();
		System.out.print("Enter month and year to calculate income (MM/yyyy): ");
		String monthAntYear = sc.next();
		int month = Integer.parseInt(monthAntYear.substring(0, 2));
		int year = Integer.parseInt(monthAntYear.substring(3));
		
		System.out.println("Name: "+ worker.getName());
		System.out.println("Department: "+ worker.getDepartment());
		System.out.println("Income for"+ monthAntYear + ": " + String.format("%.2f", worker.income(year, month)));
		
		sc.close();

	}

}
