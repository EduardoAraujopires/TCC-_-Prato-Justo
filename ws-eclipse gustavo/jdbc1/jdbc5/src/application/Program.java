package application;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import db.DB;
import db.DbException;
import db.DbIntegrityException;

public class Program {

	public static void main(String[] args) {

		Connection conn = null;
		PreparedStatement st = null;
		
		try {
			conn = DB.getConnetion();
			
			st = conn.prepareStatement(
				"DELETE FROM department "
				+ "WHERE "
				+ "Id = ?");
			
			st.setInt(1,4);
					
			int rowsAffected = st.executeUpdate();
			
			System.out.println("Done! Rows affected: " + rowsAffected);
			
		}
		catch(SQLException e) {
			throw new DbIntegrityException(e.getMessage());
		}
	
		finally{
			DB.closeStatement(st);
			DB.closeConnection();
		}
	
	}

}
