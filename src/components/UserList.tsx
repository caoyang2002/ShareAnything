'use client';

import { User } from '@/types';
import { Users } from 'lucide-react';

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">
          在线用户 ({users.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-sm font-medium text-gray-900">
              {user.name}
              {user.id === currentUserId && ' (你)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}