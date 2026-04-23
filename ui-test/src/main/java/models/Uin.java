package models;

public class Uin {
    private String uin;
    private String phone;
    private String email;

    public Uin(String uin, String phone, String email) {
        this.uin = uin;
        this.phone = phone;
        this.email = email;
    }

    // ✅ For Land Registry flow
    public Uin(String uin) {
        this.uin = uin;
    }
    
    public String getUin() {
        return uin;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "UIN{" +
                "uin='<redacted>'" +
                ", phone='<redacted>'" +
                ", email='<redacted>'" +
                '}';
    }
}