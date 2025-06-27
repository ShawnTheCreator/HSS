import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UserCheck, UserX } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://hss-backend.onrender.com/api/auth/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({ title: "Error", description: "Could not fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: "approve" | "reject" | "unapprove") => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = `https://hss-backend.onrender.com/api/auth/admin/users/${id}/${action}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update user approval status");

      let message =
        action === "approve"
          ? "User approved successfully"
          : action === "reject"
          ? "User rejected successfully"
          : "User unapproved successfully";

      toast({ title: "Success", description: message });
      fetchUsers();
    } catch (err) {
      toast({ title: "Error", description: "Approval update failed", variant: "destructive" });
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
    <motion.div
      className="p-6 space-y-6 bg-gray-50 dark:bg-background rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1 layoutId="title" className="text-3xl font-bold text-primary">
        Admin Dashboard
      </motion.h1>

      <motion.div layout className="flex flex-col md:flex-row md:items-center gap-4">
        <Input
          placeholder="Search by hospital or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>Approved</Button>
          <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>Pending</Button>
        </div>
      </motion.div>

      <ScrollArea className="h-[70vh] rounded-md border p-4 bg-white dark:bg-muted">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 space-y-2 border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{user.hospitalName}</h2>
                        <p className="text-sm text-muted-foreground">{user.emailId} | {user.phoneNumber}</p>
                        <p className="text-sm text-muted-foreground">{user.province}, {user.city}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            user.isApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isApproved ? <UserCheck size={12} /> : <UserX size={12} />}
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
                    <div className="flex gap-2 mt-2">
                      {!user.isApproved ? (
                        <>
                          <Button onClick={() => handleApproval(user._id, "approve")} className="w-full">
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleApproval(user._id, "reject")}
                            className="w-full"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => handleApproval(user._id, "unapprove")}
                          className="w-full"
                        >
                          Unapprove
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </ScrollArea>
    </motion.div>
  );
};

export default AdminDashboard;
