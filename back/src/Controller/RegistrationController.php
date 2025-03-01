<?php

namespace App\Controller;

use ApiPlatform\Validator\ValidatorInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $userPasswordHasher, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['username']) || !isset($data['password'])) {
            return $this->json(['message' => 'Username or password is missing'], 400);
        }
        $existingUser = $em->getRepository(User::class)->findOneBy(['username' => $data['username']]);
        if ($existingUser) {
            return $this->json(['message' => 'Username already exists'], 409);
        }
        $user = new User();
        $user->setUsername($data['username']);
        $user->setPassword($userPasswordHasher->hashPassword($user, $data['password']));
        $error = $validator->validate($user);
        if ($error->count() > 0) {
            return $this->json($error, 400);
        }
        $em->persist($user);
        $em->flush();
        return $this->json(['message' => 'User successfully registered'], Response::HTTP_CREATED);

    }
}
