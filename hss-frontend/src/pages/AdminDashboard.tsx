import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

interface HospitalUser {
  _id: string;
  hospitalName: string;
  contactPersonName: string;
  email: string;
  emailId: string;
  phoneNumber: string;
  province: string;
  city: string;
  location_address: string;
  gps_coordinates?: string;
  device_fingerprint?: string;
  isApproved: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://hss-backend.onrender.com/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({ title: "Error", description: "Could not fetch users", variant: "destructive" });
    }
  };

  const handleApproval = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://hss-backend.onrender.com/api/admin/approve/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to approve user");

      toast({ title: "Success", description: "User approved successfully" });
      fetchUsers();
    } catch (err) {
      toast({ title: "Error", description: "Approval failed", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      user.emailId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && user.isApproved) ||
      (filter === "pending" && !user.isApproved);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Input
          placeholder="Search by hospital or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>Approved</Button>
          <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>Pending</Button>
        </div>
      </div>

      <ScrollArea className="h-[70vh] rounded-md border p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="p-4 space-y-2">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{user.hospitalName}</h2>
                  <p className="text-sm text-muted-foreground">{user.emailId} | {user.phoneNumber}</p>
                  <p className="text-sm">{user.province}, {user.city}</p>
                </div>
                <div className="text-right space-y-1">
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
      user.isApproved
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {user.isApproved ? "Approved" : "Pending"}
  </span>
  <p className="text-xs text-muted-foreground">
    {new Date(user.createdAt).toLocaleDateString()}
  </p>
</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Contact:</strong> {user.contactPersonName} <br />
                <strong>Address:</strong> {user.location_address}
              </div>
              {!user.isApproved && (
                <Button onClick={() => handleApproval(user._id)} className="mt-2">
                  Approve
                </Button>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;
